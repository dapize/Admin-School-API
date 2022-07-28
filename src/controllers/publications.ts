import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

import paths from '../config/paths';

import publicationModel, { IPublication } from '../models/publication';
import resHandler from '../helpers/resHandler';

import { IFile } from '../middleware/uploadFile';

interface IPublicationDb extends IPublication {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export const newPublicationCtrl = async ( req: Request, res: Response ) => {
  const { filename: image } = <IFile>req.file;
  const { title, description } = req.body;

  try {
    const publicationCreated = await publicationModel.create({
      title,
      description,
      image
    })
    resHandler({
      statusCode: 200,
      response: res,
      message: 'Publicación creada con éxito',
      extraSend: {
        _id: publicationCreated._id
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'newPublicationCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error procesando la nueva publicación',
      error: err as Error
    })
  }
}

export const publicationsListCtrl = async ( req: Request, res: Response ) => {
  const { limit, title } = req.query;

  const byTitle = title ? { title: new RegExp( title as string, 'i' ) } : {};

  try {
    const dbList: IPublicationDb[] = await publicationModel.find( byTitle, null, {
      sort: { 'createdAt' : -1 },
      limit: limit ? Number( limit ) : 999
    });
    const list = dbList.map( (item: IPublicationDb) => {
      const { _id, title, description, image, createdAt } = item;
      return {
        _id,
        title,
        description,
        image: `${ process.env.BASE_URL }/uploads/images/publications/${ image }`,
        createdAt
      };
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
      codeName: 'publicationsListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de publicaciones',
      error: err as Error
    })
  }
}

export const deletePublicationCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  try {
    const findPublication = await publicationModel.findOne({ _id: id }, { image: true });
    if ( !findPublication ) {
      const notFoundPublic = 'No fué posible encontrar la publicación con el ID: ' + id;
      resHandler({
        codeName: 'deletePublicationCtrl',
        statusCode: 409,
        response: res,
        message: notFoundPublic,
        error: notFoundPublic
      })
      return;
    }

    const publicDeleted = await publicationModel.deleteOne({ _id: id });
    if ( !publicDeleted.deletedCount ) {
      const notDeleted = 'No fué posible borrar la publicación con el ID: ' + id;
      resHandler({
        codeName: 'deletePublicationCtrl',
        statusCode: 409,
        response: res,
        message: notDeleted,
        error: notDeleted
      })
      return;
    }

    // deleting the image associated
    const pathImage = path.join(path.resolve('./'), paths.images.publications, findPublication.image);
    await fs.unlink( pathImage );

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Publicación eliminada con éxito'
    })

  } catch ( err ) {
    resHandler({
      codeName: 'deletePublicationCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error borrando la publicación con ID: ' + id,
      error: err as Error
    })
  }
}

export const updatePublicationCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const reqFile = <IFile>req.file;
  const image = reqFile ? reqFile.filename : '';

  const newData: {
    title?: string;
    description?: string;
    image?: string;
  } = {};

  if ( title ) newData.title = title;
  if ( description ) newData.description = description;
  if ( image ) newData.image = image;

  if ( !Object.keys( newData ).length ) {
    resHandler({
      statusCode: 200,
      response: res,
      message: 'No hubo nada nuevo para actualizar en la publicación.'
    })
    return;
  }

  try {
    if ( image ) {
      // searching the path of the old image
      const publicationFound = await publicationModel.findOne({ _id: id }, { image: true });
      if ( !publicationFound ) {
        resHandler({
          statusCode: 200,
          response: res,
          message: 'No se encontró la publicación con el ID ' + id
        })
        return;
      }

      // deleting the old image
      const pathImageOld = path.join(path.resolve('./'), paths.images.publications, publicationFound.image);
      await fs.unlink( pathImageOld );
    }

    // updating the publication
    await publicationModel.updateOne( { _id: id }, newData );
    resHandler({
      statusCode: 200,
      response: res,
      message: '¡Publicación actualizada con éxito!'
    })

  } catch ( err ) {
    resHandler({
      codeName: 'publicationsListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al procesar la actualización de la publicación.',
      error: err as Error
    })
  }
}
