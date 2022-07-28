import { Request, Response } from 'express';

import courseModel from '../models/courses';
import resHandler from '../helpers/resHandler';
import code from '../utils/codeGenerator';

export const newCourseCtrl = async ( req: Request, res: Response ) => {
  const { name, competencies } = req.body;

  try {
    const courseCreated = await courseModel.create({
      code: code( name ),
      name,
      competencies
    });

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Curso creado con éxito',
      extraSend: {
        _id: courseCreated._id
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'newCourseCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error procesando el nuevo curso',
      error: err as Error
    })
  }
}

export const coursesListCtrl = async ( req: Request, res: Response ) => {
  try {
    const list = await courseModel.find({}, { createdAt: false, updatedAt: false});
    resHandler({
      statusCode: 200,
      response: res,
      extraSend: {
        list
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'coursesListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de publicaciones',
      error: err as Error
    })
  }
}
