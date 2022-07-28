import { Request, Response } from 'express';

import resHandler from '../helpers/resHandler';
import { encrypt } from '../helpers/handleBcrypt';
import teacherData from '../helpers/teacher';

import teacherModel, { ITeacherDb } from '../models/teacher';
import userModel, { IPUser } from '../models/user';

import code from '../utils/codeGenerator';
import fieldsToRemove from '../helpers/fieldsToRemove';

interface ITeacherFilter {
  dni?: RegExp;
  lastName?: RegExp;
  speciality?: RegExp
}

export const newTeacherCtrl = async ( req: Request, res: Response ) => {
  const { dni, name } = req.body;
  const newData = teacherData( req.body );

  try {

    const findOneTeacher = await userModel.findOne({ dni }, { _id: true });
    if ( findOneTeacher ) {
      // resolving the request
      const message = `Ya existe un docente registrado con el DNI ${ dni }`;
      resHandler({
        codeName: 'newTeacherCtrl',
        statusCode: 409,
        message: message,
        error: message as string,
        response: res,
        extraSend: {
          id: findOneTeacher._id
        }
      });
      return;
    }

    // creating the user of the teacher
    const password = await encrypt( dni );
    const userCreated = await userModel.create({
      name,
      dni,
      password,
      role: 'teacher'
    });

    // creating teacher
    const teacherCreated = await teacherModel.create( {
      code: code( name ),
      ...newData,
      user: userCreated._id
    } );

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Docente registrado con éxito',
      extraSend: {
        _id: teacherCreated._id
      }
    })

  } catch ( err ) {
    resHandler({
      codeName: 'newTeacherCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error procesando el registro del docente',
      error: err as Error
    })
  }
}

export const teachersListCtrl = async ( req: Request, res: Response ) => {
  const { dni, lastName, speciality } = req.query;

  // building the search, if is neccesarry of course
  const filter: ITeacherFilter = {};
  if ( dni ) filter.dni = new RegExp( dni as string, 'i' );
  if ( lastName ) filter.lastName = new RegExp( lastName as string, 'i' );
  if ( speciality ) filter.speciality = new RegExp( speciality as string, 'i' );

  try {
    const list: ITeacherDb[] = await teacherModel.find( filter, { updatedAt: false }, {
      sort: { 'createdAt' : -1 }
    });

    resHandler({
      statusCode: 200,
      response: res,
      extraSend: {
        list
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'teachersListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de docentes',
      error: err as Error
    })
  }
}

export const deleteTeacherCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  try {
    const findTeacher = await teacherModel.findOne({ _id: id });
    if ( !findTeacher ) {
      const notFoundPublic = 'No fué posible encontrar el docente con el ID: ' + id;
      resHandler({
        codeName: 'deleteTeacherCtrl',
        statusCode: 409,
        response: res,
        message: notFoundPublic,
        error: notFoundPublic
      })
      return;
    }

    const teacherDeleted = await teacherModel.deleteOne({ _id: id });
    if ( !teacherDeleted.deletedCount ) {
      const notDeleted = 'No fué posible borrar el docente con el ID: ' + id;
      resHandler({
        codeName: 'deleteTeacherCtrl',
        statusCode: 409,
        response: res,
        message: notDeleted,
        error: notDeleted
      })
      return;
    }

    const userDeleted = await userModel.deleteOne({ dni: findTeacher.dni });
    if ( !userDeleted.deletedCount ) {
      const notDeleted = 'No fué posible borrar del docente con el ID: ' + id;
      resHandler({
        codeName: 'deleteTeacherCtrl',
        statusCode: 500,
        response: res,
        message: notDeleted,
        error: notDeleted
      })
      return;
    }

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Docente eliminado con éxito'
    })

  } catch ( err ) {
    resHandler({
      codeName: 'deleteTeacherCtrl',
      statusCode: 409,
      response: res,
      message: 'Ocurrió un error borrando la docente con ID: ' + id,
      error: err as Error
    })
  }
}

export const updateTeacherCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  const newData = teacherData( req.body );
  const { dni, name } = newData;

  if ( !Object.keys( newData ).length ) {
    resHandler({
      statusCode: 200,
      response: res,
      message: 'No hubo nada nuevo para actualizar al docente.'
    })
    return;
  }

  try {

    // updating the user vinculated
    if ( dni || name ) {
      const currentData = await teacherModel.findOne({ _id: id }, { dni: true });
      if ( currentData ) {
        const newUserData: IPUser = {};
        if ( dni ) newUserData.dni = dni;
        if ( name ) newUserData.name = name;
        if ( Object.keys( newUserData ).length ) await userModel.updateOne({ dni: currentData.dni }, newUserData );
      }
    }

    // updating the teacher
    const fieldsToBeRemove = fieldsToRemove( newData, ['cellphone', 'email'] );
    await teacherModel.updateOne( { _id: id }, {
      ...newData,
      $unset: fieldsToBeRemove
    });

    resHandler({
      statusCode: 200,
      response: res,
      message: '¡Docente actualizado con éxito!'
    })

  } catch ( err ) {
    resHandler({
      codeName: 'updateTeacherCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al procesar la actualización del docente.',
      error: err as Error
    })
  }
}

export const resetTeacherCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;

  try {
    const findTeacher = await teacherModel.findOne({ _id: id }, { dni: true });
    if ( !findTeacher ) {
      const notFoundTeacher = 'No fué posible encontrar el docente con el ID: ' + id;
      resHandler({
        codeName: 'resetTeacherCtrl',
        statusCode: 409,
        response: res,
        message: notFoundTeacher,
        error: notFoundTeacher
      })
      return;
    }

    const dni = findTeacher.dni;
    const password = await encrypt( dni );
    await userModel.updateOne( { dni }, { password } );
    resHandler({
      statusCode: 200,
      response: res,
      message: `¡Password del docente con el DNI ${ dni } reseteada con éxito!`
    })

  } catch ( err ) {
    resHandler({
      codeName: 'resetTeacherCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al procesar el reseteo de la password del docente.',
      error: err as Error
    })
  }
}
