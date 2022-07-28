import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

import paths from '../config/paths';
import { IAuthorPersonalData } from '../interfaces/author';

import materialModel, { IMaterial, IMaterialDb } from '../models/material';
import studentModel from '../models/student';

import mimeTypes from '../utils/mimeTypes';

import resHandler from '../helpers/resHandler';
import getIdByRole from '../helpers/getIdByRole';

import { IFile } from '../middleware/uploadFile';


export const newMaterialCtrl = async ( req: Request, res: Response ) => {
  const { filename: file } = <IFile>req.file;
  const { grade, course, bimester, week } = req.body;
  const { role, jwtPayload: { dni } } = res.locals;

  try {
    // getting data in conditional way
    const owner = role === 'administrator' ? req.body.owner : await getIdByRole( role, dni );
    const source = role === 'administrator' ? 'teacher' : role;

    // creating the reg
    const materialCreated = await materialModel.create({
      source,
      file,
      owner,
      grade,
      course,
      bimester,
      week
    });
    resHandler({
      statusCode: 200,
      response: res,
      message: 'Archivo subido con éxito',
      extraSend: {
        _id: materialCreated._id
      }
    })
  } catch ( err ) {
    // deleting the material uploaded
    const pathImage = path.join(path.resolve('./'), paths.materials, file);
    await fs.unlink( pathImage );

    // responding
    resHandler({
      codeName: 'newMaterialCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error subiendo el archivo',
      error: err as Error
    })
  }
}

export const deleteMaterialCtrl = async ( req: Request, res: Response ) => {
  const { role, jwtPayload: { dni } } = res.locals;
  const { id } = req.params;

  try {
    // getting the id from role
    const owner = await getIdByRole( role, dni );

    // searching the file saved
    const findMaterial = await materialModel.findById( id , { file: true, owner: true, _id: false });
    if ( !findMaterial ) {
      const notFoundFile = 'No fué posible encontrar el archivo con el ID: ' + id;
      resHandler({
        codeName: 'deletePublicationCtrl',
        statusCode: 409,
        response: res,
        message: notFoundFile,
        error: notFoundFile
      })
      return;
    }

    // cheking if the file to delete
    if ( role !== 'administrator' && owner.toString() !== findMaterial.owner ) {
      const notAllowedMessage = 'No está permitido que borres el archivo con el ID: ' + id;
      resHandler({
        codeName: 'deleteMaterialCtrl',
        statusCode: 409,
        response: res,
        message: notAllowedMessage,
        error: notAllowedMessage
      })
      return;
    }

    // deleting the reg in the DB
    const materialDeleted = await materialModel.deleteOne({ _id: id });
    if ( !materialDeleted.deletedCount ) {
      const notDeleted = 'No fué posible borrar el archivo con el ID: ' + id;
      resHandler({
        codeName: 'deleteMaterialCtrl',
        statusCode: 500,
        response: res,
        message: notDeleted,
        error: notDeleted
      })
      return;
    }

    // deleting the file saved
    const pathImage = path.join(path.resolve('./'), paths.materials, findMaterial.file);
    await fs.unlink( pathImage );

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Archivo borrado con éxito'
    })
  } catch ( err ) {
    resHandler({
      codeName: 'deleteMaterialCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error subiendo el archivo',
      error: err as Error
    })
  }
}

export const materialsListCtrl = async ( req: Request, res: Response ) => {
  const { owner, grade, course, bimester, week } = req.query;
  const { role, jwtPayload: { dni } } = res.locals;

  try {
    // getting the id from role to check if is valid this request
    const ownerByRole = await getIdByRole( role, dni );
    if ( role === 'student' && ownerByRole.toString() !== owner ){
      const reqNotValidMsg = 'Esta solicitud no es válida';
      resHandler({
        codeName: 'materialsListCtrl',
        statusCode: 401,
        response: res,
        message: reqNotValidMsg,
        error: reqNotValidMsg
      })
      return;
    }

    // listing the files
    const findAllTeachers: IMaterialDb[] = await materialModel.find({
      source: 'teacher',
      grade: Number( grade ),
      course: course as string,
      bimester: Number( bimester ),
      week: Number( week ),
    },{ updatedAt: false } );

    let beatifulTeachersList = findAllTeachers
      .filter( ( item: IMaterialDb ) => {
        if ( role !== 'teacher' ) return true;
        return item.owner === owner;
      })
      .map( ( item: IMaterialDb ) => {
        const { _id, file: name, owner, source, grade, course, bimester, week, createdAt } = item;
        return {
          _id,
          name,
          owner,
          source,
          grade,
          course,
          bimester,
          week,
          createdAt
        }
      });

    const filterFindStudent: FilterQuery<IMaterial> = {
      source: 'student',
      grade: Number( grade ),
      course: course as string,
      bimester: Number( bimester ),
      week: Number( week )
    };

    if ( role === 'student' ) filterFindStudent.owner = owner as string;

    const findByStudents: IMaterialDb[] = await materialModel
      .find( filterFindStudent, { updatedAt: false } )
      .populate({
        path: 'owner',
        model: studentModel,
        select: '-_id -user -dni -createdAt -updatedAt'
      });

    const listByStudents = findByStudents.map( ( item: IMaterialDb ) => {
      const { _id, file, source, grade, course, bimester, week, createdAt } = item;
      const { lastName, secondLastName, name } = item.owner as IAuthorPersonalData;
      return {
        _id,
        name: file,
        source,
        grade,
        course,
        bimester,
        week,
        createdAt,
        owner: `${ lastName } ${ secondLastName } ${ name }`
      }
    })

    resHandler({
      statusCode: 200,
      response: res,
      extraSend: {
        list: [ ...beatifulTeachersList, ...listByStudents ]
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'materialsListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de archivos',
      error: err as Error
    })
  }
}

export const getMaterialCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  const { role, jwtPayload: { dni } } = res.locals;

  try {
    const owner = await getIdByRole( role, dni );

    const materialData = await materialModel.findById( id, {
      updatedAt: false
    });

    if ( !materialData ) {
      const notFoundFile = 'No fué posible encontrar el archivo con el ID: ' + id;
      resHandler({
        codeName: 'getMaterialCtrl',
        statusCode: 409,
        response: res,
        message: notFoundFile,
        error: notFoundFile
      })
      return;
    }

    // streaming the file
    const fileName = materialData.file;
    const extension = path.extname( fileName ).substring( 1 );
    const output = path.join( paths.materials, fileName );
    const stat = await fs.stat( output );
    const file = fsSync.createReadStream( output );
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', mimeTypes[ extension ]);
    res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename( output ));
    file.pipe( res );

  } catch ( err ) {
    resHandler({
      codeName: 'materialsListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de archivos',
      error: err as Error
    })
  }
}
