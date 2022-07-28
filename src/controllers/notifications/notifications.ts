import { Request, Response } from 'express';

import { IQuestionDb } from '../../models/question';
import { IAnswerDb } from '../../models/answers';
import userModel from '../../models/user';
import { INotificationDb, INotificationRecord, INotificationResponse } from '../../models/notification';
import courseModel, { ICourse } from '../../models/courses';

import resHandler from "../../helpers/resHandler";

import getFullName from './getFullName';
import normalizeRoleName from './normalizeRoleName';

import { IAuthorPersonalData } from '../../interfaces/author';
import getCourseName from './getCourseName';


export const listNotificationsCtrl = async ( req: Request, res: Response ) => {
  const { jwtPayload: { dni } } = res.locals;
  const { limit } = req.query;

  try {
    const userData = await userModel
      .findOne({ dni }, { notifications: true })
      .populate({
        path: 'notifications.list.source',
        select: 'type question answer',
        populate: [
          {
            path: 'question',
            select: 'author source grade theme course',
            populate: {
              path: 'author',
              select: 'name lastName secondLastName -_id'
            },
          },
          {
            path: 'answer',
            select: 'author source',
            populate: {
              path: 'author',
              select: 'name lastName secondLastName -_id'
            }
          }
        ]
      })
      .lean();

    if ( !userData ) {
      const message = `Usuario con DNI ${ dni } no encontrado`;
      resHandler({
        codeName: 'listNotificationsCtrl',
        statusCode: 409,
        message: message,
        error: message as string,
        response: res
      });
      return;
    }

    // get the list of courses
    const coursesList: ICourse[] = await courseModel.find({});

    // building the notifications list
    const notifications: INotificationResponse[] = userData.notifications.list
      .reverse()
      .slice( 0, limit ? Number( limit ) : 999 )
      .map( ( item: INotificationRecord ) => {
        const source = item.source as INotificationDb;
        const question = source.question as IQuestionDb;
        const answer = source.answer as IAnswerDb;
        const fullName = getFullName( source.type === 'answer' ? ( answer.author as IAuthorPersonalData ) : ( question.author as IAuthorPersonalData ) );
        const role = normalizeRoleName( source.type === 'answer' ? answer.source : question.source );
        const sourceQuestion = question.theme === 'general' ? 'general' : getCourseName( question.course!, coursesList );

        const rData: INotificationResponse = {
          _id: source._id.toString(),
          type: source.type,
          question: question._id.toString(),
          grade: question.grade,
          role,
          fullName,
          checked: item.checked,
          source: sourceQuestion,
          createdAt: item.createdAt as Date
        }
        if ( answer ) rData.answer = answer._id.toString();

        return rData
      })

    resHandler({
      statusCode: 200,
      response: res,
      extraSend: {
        list: notifications
      }
    })

  } catch ( err ) {
    resHandler({
      codeName: 'listNotificationsCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error enlistando las notificaciones',
      error: err as Error
    })
  }
}

export const revisedNotificationsCtrl = async ( req: Request, res: Response ) => {
  const { jwtPayload: { dni } } = res.locals;

  try {
    await userModel.updateOne({ dni }, {
      $set: {
        'notifications.revised': {
          status: true,
          updatedAt: new Date().toISOString()
        }
      }
    })

    resHandler({
      statusCode: 200,
      response: res
    })

  } catch ( err ) {
    resHandler({
      codeName: 'revisedNotificationsCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error actualizando el estado de las notificaciones a "revizadas"',
      error: err as Error
    })
  }
}

export const notificationCheckedCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  const { jwtPayload: { dni } } = res.locals;

  try {
    await userModel.updateOne(
      {
        dni,
        'notifications.list.source': id
      },
      {
        $set: {
          'notifications.list.$.checked': true
        }
      }
    );

    resHandler({
      statusCode: 200,
      response: res
    })

  } catch ( err ) {
    resHandler({
      codeName: 'notificationCheckedCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error actualizando el estado de la notificacion con el ID ' + id,
      error: err as Error
    })
  }
}
