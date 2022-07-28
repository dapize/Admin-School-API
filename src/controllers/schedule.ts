import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

import scheduleModel from '../models/schedule';
import resHandler from '../helpers/resHandler';

import paths from '../config/paths';

import { IFile } from '../middleware/uploadFile';
import { numberToGrade } from '../helpers/numberTo';


export const newScheduleCtrl = async ( req: Request, res: Response ) => {
  const { filename } = <IFile>req.file;
  const { grade } = req.body;

  try {
    await scheduleModel.create({
      grade,
      image: filename
    })

    const image = `${ process.env.BASE_URL }/uploads/images/schedules/${ filename }`;

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Horario guardado con éxito',
      extraSend: {
        image
      }
    })
  } catch ( err ) {
    // deleting the image uploaded
    const pathImage = path.join(path.resolve('./'), paths.images.schedules, filename);
    await fs.unlink( pathImage );

    // responding with a error
    resHandler({
      codeName: 'newScheduleCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error guardando el horario escolar',
      error: err as Error
    })
  }
}

export const getScheduleCtrl = async ( req: Request, res: Response ) => {
  const { grade } = req.params;

  try {
    const findSchedule = await scheduleModel.findOne({
      grade: Number( grade )
    }, {
      image: true,
      _id: false
    });

    const image = findSchedule ? `${ process.env.BASE_URL }/uploads/images/schedules/${ findSchedule.image }` : ''

    resHandler({
      statusCode: 200,
      response: res,
      extraSend: {
        image
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'getScheduleCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error guardando el horario escolar',
      error: err as Error
    })
  }
}

export const deleteScheduleCtrl = async ( req: Request, res: Response ) => {
  const { grade: gradeParam } = req.params;
  const grade = Number( gradeParam );
  const gradeName = numberToGrade( grade );

  try {
    const findSchedule = await scheduleModel.findOne({ grade }, { image: true });
    if ( !findSchedule ) {
      const notFoundSchedule = `No fué posible encontrar el horario escolar del grado ${ gradeName } por lo tanto suponemos que no existe`;
      resHandler({
        statusCode: 200,
        response: res,
        message: notFoundSchedule
      })
      return;
    }

    const scheduleDeleted = await scheduleModel.deleteOne({ grade });
    if ( !scheduleDeleted.deletedCount ) {
      const notDeleted = 'No fué posible borrar el horario escolar del grado: ' + gradeName;
      resHandler({
        codeName: 'deleteScheduleCtrl',
        statusCode: 409,
        response: res,
        message: notDeleted,
        error: notDeleted
      })
      return;
    }

    // deleting the image of the schedule school
    const pathImage = path.join(path.resolve('./'), paths.images.schedules, findSchedule.image);
    await fs.unlink( pathImage );

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Horario escolar eliminado con éxito'
    })

  } catch ( err ) {
    resHandler({
      codeName: 'deleteScheduleCtrl',
      statusCode: 409,
      response: res,
      message: 'Ocurrió un error borrando el horario escolar del grado: ' + gradeName,
      error: err as Error
    })
  }
}

export const updateScheduleCtrl = async ( req: Request, res: Response ) => {
  const { grade: gradeParam } = req.params;
  const reqFile = <IFile>req.file;
  const grade = Number( gradeParam );

  try {
    // searching the path of the old image
    const scheduleFound = await scheduleModel.findOne({ grade }, { image: true });
    if ( !scheduleFound ) {
      resHandler({
        statusCode: 200,
        response: res,
        message: 'No se encontró el horario escolar para el grado ' + grade
      })
      return;
    }

    // deleting the old image
    const pathImageOld = path.join(path.resolve('./'), paths.images.schedules, scheduleFound.image);
    await fs.unlink( pathImageOld );


    // updating the publication
    const fileName = reqFile.filename;
    await scheduleModel.updateOne( { grade }, { image: fileName } );
    const image = `${ process.env.BASE_URL }/uploads/images/schedules/${ fileName }`;

    resHandler({
      statusCode: 200,
      response: res,
      message: '¡Horario escolar actualizado con éxito!',
      extraSend: {
        image
      }
    })

  } catch ( err ) {
    resHandler({
      codeName: 'updateScheduleCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al procesar la actualización del horario escolar',
      error: err as Error
    })
  }
}
