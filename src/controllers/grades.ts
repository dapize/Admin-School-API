import { Request, Response } from 'express';

import gradeModel from '../models/grade';
import resHandler from '../helpers/resHandler';

export const newGradeCtrl = async ( req: Request, res: Response ) => {
  const { name, position, courses } = req.body;

  try {
    const courseCreated = await gradeModel.create({
      name,
      position,
      courses
    });

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Grado creado con éxito',
      extraSend: {
        _id: courseCreated._id
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'newGradeCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error creando el nuevo grado',
      error: err as Error
    })
  }
}

export const gradesListCtrl = async ( req: Request, res: Response ) => {
  try {
    const list = await gradeModel.find({}, { createdAt: false, updatedAt: false});
    resHandler({
      statusCode: 200,
      response: res,
      extraSend: {
        list
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'gradesListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de grados',
      error: err as Error
    })
  }
}
