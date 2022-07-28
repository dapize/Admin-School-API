import { Request, Response } from 'express';
import { Types, FilterQuery } from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

import paths from '../../config/paths';

import answerModel, { IAnswer, IAnswerDb } from '../../models/answers';
import questionModel, { IQuestionDb, TSource } from '../../models/question';
import studentModel, { IStudent } from '../../models/student';
import teacherModel from '../../models/teacher';
import notificationModel, { INotification, INotificationDb, INotificationResponse } from '../../models/notification';
import userModel from '../../models/user';

import resHandler from '../../helpers/resHandler';

import { IFile } from '../../middleware/uploadFile';
import addFullName, { IAnswerResponse } from './addFullName';
import deleteFileUploaded from './deleteFileUploaded';
import getPersonalDataByRole from '../questions/getPersonalData';

import { notify } from '../../socket/notification';


export const newAnswerCtrl = async ( req: Request, res: Response ) => {
  const { question, content } = req.body;
  const { role: source , jwtPayload: { dni } } = res.locals;
  const reqFile = <IFile>req.file;
  const file = reqFile ? reqFile.filename : '';

  try {
    // getting data in conditional way
    const author = await getPersonalDataByRole( source, dni );

    // creating the reg
    const data: IAnswer = {
      question,
      content,
      author: author._id as Types.ObjectId,
      source: ( source === 'student' ? 'students' : 'teachers' ) as TSource,
    };
    if ( file ) data.file = file;
    const answerCreated = await answerModel.create( data );
    const answerId = answerCreated._id

    // adding +1 answers property in question
    await questionModel.updateOne({ _id: question }, { $inc: { answers: 1 }});

    // creating the notification
    const docNotification = await notificationModel.create({
      type: 'answer',
      question,
      answer: answerId
    });

    // get data of the question
    const questionData = await questionModel.findOne({ _id: question });
    if ( questionData ) {
      // getting the ID of the target ID ( to add the notification )
      let targetUserId: string = '';
      if ( questionData.source === 'students' ) {
        const findStudent = await studentModel.findOne({ _id: questionData.author as Types.ObjectId });
        if ( findStudent ) targetUserId = findStudent.user.toString();
      } else {
        const findTeacher = await teacherModel.findOne({ _id: questionData.author as Types.ObjectId });
        if ( findTeacher ) targetUserId = findTeacher.user.toString();
      }

      // adding the notification to the target user ( the user that created the question )
      await userModel.updateOne(
        {
          _id: targetUserId
        },
        {
          $set: { "notifications.revised.status": false },
          $push: { "notifications.list": {
            source: docNotification._id,
            checked: false
          }}
        }
      );

      // building the data to send in the socket notification
      const notiData: INotificationResponse = {
        _id: docNotification._id.toString(),
        type: 'answer',
        question,
        grade: questionData.grade,
        role: source,
        fullName: `${ author.lastName } ${ author.secondLastName } ${ author.name }`,
        checked: false,
        source: questionData.theme,
        createdAt: ( docNotification as INotificationDb ).createdAt as Date
      }

      // emiting notifications to the users connected
      notify( dni, notiData );


    }

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Nueva respuesta registrada con éxito',
      extraSend: {
        _id: answerCreated._id
      }
    })
  } catch ( err ) {
    if ( file ) await deleteFileUploaded( file );

    resHandler({
      codeName: 'newAnswerCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error registrando la respuesta',
      error: err as Error
    })
  }
}

export const answersListCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;

  try {
    // listing the files
    const findStudents: IAnswerDb[] = await answerModel
      .find({
        question: id,
        source: 'students'
      }, { updatedAt: false, question: false } )
      .populate({
        path: 'author',
        model: studentModel,
        select: '-user -dni -createdAt -updatedAt'
      });
    const listStudents = findStudents.length ? addFullName( findStudents ) : [];

    const findTeachers = await answerModel
      .find({
        question: id,
        source: 'teachers'
      }, { updatedAt: false, question: false } )
      .populate({
        path: 'author',
        model: teacherModel,
        select: '-code -address -cellphone -email -grades -courses -speciality -user -dni -createdAt -updatedAt'
      });
    const listTeachers = findTeachers.length ? addFullName( findTeachers ) : [];

    const list = [ ...listStudents, ...listTeachers ].sort( ( answerA: IAnswerResponse, answerB: IAnswerResponse ) => {
      return answerB.createdAt!.getTime() - answerA.createdAt!.getTime()
    })

    resHandler({
      statusCode: 200,
      response: res,
      extraSend: {
        list
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'answersListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de respuestas',
      error: err as Error
    })
  }
}

export const deleteAnswerCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  const { role, jwtPayload: { dni } } = res.locals;

  try {
    const author = await getPersonalDataByRole( role, dni );
    const authorId = author._id as Types.ObjectId;

    // finding the answer
    const findAnswer = await answerModel.findById( id );
    if ( !findAnswer ) {
      const message = `Respuesta con ID ${ id } no encontrada`;
      resHandler({
        codeName: 'deleteAnswerCtrl',
        statusCode: 409,
        message: message,
        error: message as string,
        response: res
      });
      return;
    }

    // checking if have permissions to delete the answer
    if ( role !== 'administrator' && findAnswer.author.toString() !== authorId.toString() ) {
      const message = `No estás autorizado a borrar la respuesta con ID: ${ id }`;
      resHandler({
        codeName: 'deleteAnswerCtrl',
        statusCode: 401,
        message: message,
        error: message as string,
        response: res
      });
      return;
    }

    // deleting the answer
    const answerDeleted = await answerModel.deleteOne({ _id: id });
    if ( !answerDeleted.deletedCount ) {
      const notDeleted = 'No fué posible borrar la respuesta con el ID: ' + id;
      resHandler({
        codeName: 'deleteAnswerCtrl',
        statusCode: 500,
        response: res,
        message: notDeleted,
        error: notDeleted
      })
      return;
    }

    // deleting the file attached to the answer
    if ( findAnswer.file ) {
      const pathFile = path.join(path.resolve('./'), paths.documents.answers, findAnswer.file);
      await fs.unlink( pathFile );
    }

    // deleting 1 to 'answers' property in the question
    const questionData = await questionModel.updateOne({ _id: findAnswer.question }, { $inc: { answers: -1 }});
    if ( !questionData.modifiedCount ) {
      const notDeleted = 'No fué posible actualizar la pregunta asociada a la respuesta con ID: ' + id;
      resHandler({
        codeName: 'deleteAnswerCtrl',
        statusCode: 500,
        response: res,
        message: notDeleted,
        error: notDeleted
      })
      return;
    }

    // filter base for search and delete
    const filter: FilterQuery<INotification> = { type: 'answer', question: findAnswer.question };

    // searching the ID of the notification
    const findNotification = await notificationModel
      .findOne( filter, { _id: true })
      .populate({
        path: 'question',
        populate: {
          path: 'author'
        }
      });
    if ( !findNotification ) {
      const notDeleted = 'No fué posible encontrar la notificación asociada a la respuesta con ID: ' + id;
      resHandler({
        codeName: 'deleteAnswerCtrl',
        statusCode: 500,
        response: res,
        message: notDeleted,
        error: notDeleted
      })
      return;
    }

    // deleting the notification of the users related ( students and teacher(s) )
    await userModel.updateOne(
      {
        _id: ( ( findNotification.question! as IQuestionDb ).author as IStudent ).user
      },
      {
        $pull: {
          'notifications.list': {
            source: {
              $in: findNotification._id
            }
          }
        }
      }
    );

    // finding and deleting the notification of the answer
    const notificationDeleted = await notificationModel.deleteOne( filter );
    if ( !notificationDeleted.deletedCount ) {
      const notDeleted = 'No fué posible borrar la notificación asociada a la respuesta con ID: ' + id;
      resHandler({
        codeName: 'deleteAnswerCtrl',
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
      message: 'Respuesta eliminada con éxito'
    })

  } catch ( err ) {
    resHandler({
      codeName: 'deleteAnswerCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error borrando la respuesta con ID: ' + id,
      error: err as Error
    })
  }
}
