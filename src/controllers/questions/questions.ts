import { Request, Response } from 'express';
import { FilterQuery, Types } from 'mongoose';

import questionModel, { IQuestion, TTheme, TSource, IQuestionDb } from '../../models/question';
import studentModel from '../../models/student';
import teacherModel from '../../models/teacher';
import answerModel, { IAnswerDb } from '../../models/answers';
import notificationModel, { INotificationDb, INotificationResponse } from '../../models/notification';
import userModel from '../../models/user';

import resHandler from '../../helpers/resHandler';
import getIdByRole from '../../helpers/getIdByRole';
import { IFile } from '../../middleware/uploadFile';

import addFullName, { IQuestionResponse } from './addFullName';
import deleteFileQuestionUploaded from './deleteFileUploaded';
import deleteFileAnswerUploaded from '../answers/deleteFileUploaded';
import getPersonalDataByRole from './getPersonalData';
import getUsersToNotify from './getUsersToNotify';
import { notify } from '../../socket/notification';


export const newQuestionCtrl = async ( req: Request, res: Response ) => {
  const { title, description, grade, theme, course } = req.body;
  const { role: source, jwtPayload: { dni } } = res.locals;
  const reqFile = <IFile>req.file;
  const file = reqFile ? reqFile.filename : '';

  try {
    // getting data in conditional way
    const author = await getPersonalDataByRole( source, dni );
    const authorId = author._id as Types.ObjectId;

    // creating the reg
    const data: IQuestion = {
      title,
      description,
      author: authorId,
      source: ( source === 'student' ? 'students' : 'teachers' ) as TSource,
      grade,
      theme,
      answers: 0
    };
    if ( file ) data.file = file;
    if ( course ) data.course = course;
    const questionCreated = await questionModel.create( data );
    const questionId = questionCreated._id;

    // creating the notification
    const docNotification = await notificationModel.create({
      type: 'question',
      question: questionId
    });

    // gettint the users to notify
    const usersIdsToUpdate: string[] = await getUsersToNotify( author.user as Types.ObjectId, grade, course );

    // notifying to the students ( and teachers if is need it ) of a new question
    if ( usersIdsToUpdate.length ) {

      // updating the users to update in the DB
      await userModel.updateMany(
        {
          _id: {
            $in: usersIdsToUpdate
          }
        },
        {
          $set: {
            "notifications.revised.status": false
          },
          $push: { "notifications.list": {
            source: docNotification._id,
            checked: false
          }}
        }
      );

      // building the data to send in the socket notification
      const notiData: INotificationResponse = {
        _id: docNotification._id.toString(),
        type: 'question',
        question: questionId.toString(),
        grade,
        role: source,
        fullName: `${ author.lastName } ${ author.secondLastName } ${ author.name }`,
        checked: false,
        source: theme,
        createdAt: ( docNotification as INotificationDb ).createdAt as Date
      }

      // emiting notifications to the users connected
      notify( dni, notiData );
    }

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Nueva pregunta registrada con éxito',
      extraSend: {
        _id: questionId
      }
    })
  } catch ( err ) {
    if ( file ) await deleteFileQuestionUploaded( file );

    resHandler({
      codeName: 'newQuestionCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error registrando la pregunta',
      error: err as Error
    })
  }
}

export const questionsListCtrl = async ( req: Request, res: Response ) => {
  const { grade, theme, course } = req.query;

  try {

    const filter: FilterQuery<IQuestion> = {
      grade: Number( grade ),
      theme: theme as TTheme,
      course: course as string
    }

    const projection = { updatedAt: false, theme: false, grade: false, course: false };

    // listing the files
    const findStudents = await questionModel
      .find({
        ...filter,
        source: 'students'
      }, projection )
      .populate({
        path: 'author',
        model: studentModel,
        select: '-user -dni -createdAt -updatedAt'
      });
    const listStudents = findStudents.length ? addFullName( findStudents ) : [];

    const findTeachers = await questionModel
      .find({
        ...filter,
        source: 'teachers'
      }, projection )
      .populate({
        path: 'author',
        model: teacherModel,
        select: '-code -address -cellphone -email -grades -courses -speciality -user -dni -createdAt -updatedAt'
      });
    const listTeachers = findTeachers.length ? addFullName( findTeachers ) : [];

    const list = [ ...listStudents, ...listTeachers ].sort( ( answerA: IQuestionResponse, answerB: IQuestionResponse ) => {
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
      codeName: 'questionsListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de preguntas',
      error: err as Error
    })
  }
}

export const updateQuestionCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const { role, jwtPayload: { dni } } = res.locals;

  const reqFile = <IFile>req.file;
  const file = reqFile ? reqFile.filename : '';

  let newData: {
    title?: string;
    description?: string;
    file?: string;
    $unset?: {
      file: number
    }
  } = {};

  if ( title ) newData.title = title;
  if ( description ) newData.description = description;
  if ( file ) newData.file = file;

  if ( !Object.keys( newData ).length ) {
    resHandler({
      statusCode: 200,
      response: res,
      message: 'No hubo nada nuevo para actualizar en la pregunta.'
    })
    return;
  }

  try {
    // searching the question data
    const questionFound = await questionModel.findOne({ _id: id });
    if ( !questionFound ) {
      resHandler({
        statusCode: 200,
        response: res,
        message: 'No se encontró la pregunta con el ID ' + id
      });

      if ( file ) await deleteFileQuestionUploaded( file );
      return;
    }

    // checking if have the permissions necessary to edit the question
    if ( role !== 'administrator' ) {
      const idUser = await getIdByRole( role, dni );
      if ( ( questionFound.author as Types.ObjectId ).toString() !== idUser.toString() ) {
        resHandler({
          statusCode: 401,
          response: res,
          message: '¡No estás designado para editar esta pregunta!'
        });

        if ( file ) await deleteFileQuestionUploaded( file );
        return;
      }
    }

    // deleting the old image
    if ( file && questionFound.file ) await deleteFileQuestionUploaded( questionFound.file );

    // if in the update was deleted the image
    if ( questionFound.file && !file ) {
      newData = {
        ...newData,
        $unset: {
          file: 1
        }
      }
    }

    // updating the publication
    await questionModel.updateOne( { _id: id }, newData );
    resHandler({
      statusCode: 200,
      response: res,
      message: '¡Pregunta actualizada con éxito!'
    })

  } catch ( err ) {
    if ( file ) await deleteFileQuestionUploaded( file );

    resHandler({
      codeName: 'updateQuestionCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al procesar la actualización de la pregunta.',
      error: err as Error
    })
  }
}

export const deleteQuestionCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  const { role, jwtPayload: { dni } } = res.locals;

  try {

    const authorId = await getIdByRole( role, dni );

    // finding the answer
    const questionData = await questionModel.findById( id );
    if ( !questionData ) {
      const message = `Pregunta con ID ${ id } no encontrada`;
      resHandler({
        codeName: 'deleteQuestionCtrl',
        statusCode: 409,
        message: message,
        error: message as string,
        response: res
      });
      return;
    }

    // cheking if have permissions to delete the answer
    if ( role !== 'administrator' && ( questionData.author as Types.ObjectId ).toString() !== authorId.toString() ) {
      const message = `No estás autorizado a borrar la pregunta con ID: ${ id }`;
      resHandler({
        codeName: 'deleteQuestionCtrl',
        statusCode: 401,
        message: message,
        error: message as string,
        response: res
      });
      return;
    }

    // deleting the answer
    const questionDeleted = await questionModel.deleteOne({ _id: id });
    if ( !questionDeleted.deletedCount ) {
      const notDeleted = 'No fué posible borrar la pregunta con el ID: ' + id;
      resHandler({
        codeName: 'deleteQuestionCtrl',
        statusCode: 500,
        response: res,
        message: notDeleted,
        error: notDeleted
      })
      return;
    }

    // deleting the file attached to the answer
    if ( questionData.file ) await deleteFileQuestionUploaded( questionData.file );

    // deleting files associated with the answers
    const answersAssociated = await answerModel.find({ question: id }, { file: true });
    if ( answersAssociated ) {
      const answersFiles = answersAssociated
        .filter( ( answer: IAnswerDb ) => answer.file )
        .map( ( answer: IAnswerDb ) => deleteFileAnswerUploaded( answer.file as string ));
      if ( answersFiles.length ) await Promise.all( answersFiles );
    }

    // deleting the answers associated
    if ( questionData.answers ) await answerModel.deleteMany({ question: id });

    // getting the ID of the notification for delete of the list of 'notifications' of the users associated.
    const findNotifications = await notificationModel.find({ question: id })
    if ( !findNotifications.length ) {
      const notDeleted = 'No fué posible encontrar la notificación asociada a esta pregunta con ID: ' + id;
      resHandler({
        codeName: 'deleteQuestionCtrl',
        statusCode: 500,
        response: res,
        message: notDeleted,
        error: notDeleted
      })
      return;
    }

    // getting the IDs of the notifications in string
    const notificationsIds = findNotifications.map( ( item: INotificationDb ) => ( item._id as Types.ObjectId ).toString() );

    // deleting the notification of the users related ( students and teacher(s) )
    const usersIdsToUpdate: string[] = await getUsersToNotify( questionData.author as Types.ObjectId, questionData.grade, questionData.course );
    if ( usersIdsToUpdate.length ) {
      await userModel.updateMany(
        {
          _id: {
            $in: usersIdsToUpdate
          }
        },
        {
          $pull: {
            'notifications.list': {
              source: {
                $in: notificationsIds
              }
            }
          }
        }
      );
    }

    // deleting the notifications associated ( of answers and questions types )
    await notificationModel.deleteMany({ question: id });

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Pregunta eliminada con éxito'
    })

  } catch ( err ) {
    resHandler({
      codeName: 'deleteQuestionCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error borrando la pregunta con ID: ' + id,
      error: err as Error
    })
  }
}

export const getQuestionCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;

  try {
    const questionData = await questionModel
      .findById( id, { grade: false, theme: false, course: false })
      .populate({
        path: 'author',
        select: 'name lastName secondLastName'
      });

    if ( !questionData ) {
      const message = `Pregunta con ID ${ id } no encontrada`;
      resHandler({
        codeName: 'getQuestionCtrl',
        statusCode: 409,
        message: message,
        error: message as string,
        response: res
      });
      return;
    }

    const { _id, title, description, author, source, answers, createdAt } = questionData as IQuestionDb;

    resHandler({
      statusCode: 200,
      response: res,
      extraSend: {
        _id,
        title,
        description,
        author,
        source: source === 'students' ? 'student' : 'teacher',
        answers,
        createdAt
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'questionsListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de preguntas',
      error: err as Error
    })
  }
}

