import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { encrypt, compare } from '../helpers/handleBcrypt';

import userModel, { ILogged } from '../models/user';
import teacherModel from '../models/teacher';
import studentModel from '../models/student';
import tuitionModel from '../models/tuition';

import resHandler from '../helpers/resHandler';
import { INotificationRecord } from '../models/notification';

export const loginCtrl = async ( req: Request, res: Response ) => {
  try {
    const { dni, password } = req.body;
    const userData = await userModel.findOne({ dni });

    // when user is not found.
    if ( !userData ) {
      const message = `Usuario con DNI ${ dni } no encontrado`;
      resHandler({
        codeName: 'loginCtrl > DNI',
        statusCode: 409,
        message: message,
        error: message as string,
        response: res
      });
      return;
    }

    // user exists lets compare the password passed
    const passwordMatch = await compare( password, userData.password );
    if ( !passwordMatch ) {
      const message = `La clave para el usuario DNI ${ dni } no es la correcta`;
      resHandler({
        codeName: 'loginCtrl > password',
        statusCode: 409,
        message: message,
        error: message as string,
        response: res
      });
      return;
    }

    // Getting the JWT
    const tokenSession = await jwt.sign(
      {
        dni: userData.dni
      },
      `${ process.env.JWT_SECRET }`,
      {
        expiresIn: `${ process.env.JWT_EXPIRES_IN }`
      }
    );

    // getting the ID of the user logged it
    let id: string = userData._id;
    let grade: number = 0;
    let grades: number[] = [];
    switch( userData.role ) {
      case 'student':
        const findStudent = await studentModel.findOne({ dni }, { _id: true });
        if ( findStudent ) {
          id = findStudent._id as string;
          const findTuition = await tuitionModel.findOne({ student: id }, { grade: true });
          if ( findTuition ) grade = findTuition.grade;
        }
        break;

      case 'teacher':
        const findTeacher = await teacherModel.findOne({ dni } );
        if ( findTeacher ) {
          id = findTeacher._id as string;
          grades = findTeacher.grades;
        }
        break;
    }

    // get number of notifications
    const notifications = userData.notifications;
    const lastRevisedDate = new Date( notifications.revised.updatedAt ).getTime();
    let nNotifications: number = 0;
    if ( notifications ) {
      if ( notifications.revised.status ) {
        nNotifications = 0;
      } else {
        nNotifications = notifications.list
          .filter( ( item: INotificationRecord ) => !item.checked )
          .filter( ( item: INotificationRecord ) => item.createdAt!.getTime() > lastRevisedDate )
          .length;
      }
    }

    // building the data to the 'response'
    const dataResponse: ILogged = {
      id,
      name: userData.name,
      role: userData.role,
      tokenSession
    }
    if ( userData.role === 'student' ) dataResponse.grade = grade
    if ( userData.role === 'teacher' ) dataResponse.grades = grades;
    if ( userData.role !== 'administrator') dataResponse.notifications = nNotifications;

    // Finally, responding the data
    resHandler({
      statusCode: 200,
      response: res,
      extraSend: dataResponse
    })
  } catch ( err ) {
    resHandler({
      codeName: 'auth > loginCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error procesando la solicitud, intentelo en unos minutos',
      error: err as Error
    })
  }
}

export const registerCtrl = async ( req: Request, res: Response ) => {
  try {
    const { name, dni, password: passwordToEncript, role } = req.body;
    const password = await encrypt( passwordToEncript );
    await userModel.create({
      name,
      dni,
      password,
      role
    });
    resHandler({
      statusCode: 200,
      response: res,
      message: '¡Usuario creado correctamente!'
    });
  } catch ( err ) {
    resHandler({
      codeName: 'auth > registerCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error procesando la solicitud, intentelo en unos minutos',
      error: err as Error
    })
  }
}
