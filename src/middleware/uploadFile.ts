import path from 'path';
import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';

import resHandler from '../helpers/resHandler';
import errorCodeToMessage from '../helpers/errorCodeToMessage';
import sanitizeString from '../utils/sanitizeString';
import { IMimeTypes } from '../utils/mimeTypes';

export const fileProps = {
  fieldname: "string",
  originalname: "string",
  encoding: "string",
  mimetype: "string",
  size: "number",
  destination: "string",
  filename: "string",
  path: "string"
};

export interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number
}

interface IUploadFile {
  fileSize: number,
  mimeTypes: IMimeTypes,
  keyName: string,
  destination: string
}

const uploadFile = ( { destination, mimeTypes, fileSize, keyName }: IUploadFile ) => {
  const storage = multer.diskStorage({
    destination,
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const fileExtension = path.extname( file.originalname );
      const baseName = path.basename( file.originalname, fileExtension );
      const newFileName = sanitizeString( baseName ) + '-' + Math.round(Math.random() * 1E9) + fileExtension;
      cb( null, newFileName )
    }
  });

  const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const formatValid = Object.values( mimeTypes ).includes( file.mimetype );
    if ( formatValid ) return cb( null, true );

    const errMessage = 'El archivo subido no tiene el formato correcto, solo se aceptan los siguientes formatos: ' + Object.keys( mimeTypes ).join(', ');
    resHandler({
      codeName: 'uploadFileMiddleware > fileFilter',
      message: errMessage,
    });
    const resError = new Error();
    resError.name = 'fileFilter Error';
    resError.message = errMessage;
    cb( resError )
  }

  const uploader = multer({
    limits: {
      fileSize
    },
    storage,
    fileFilter,
    preservePath: true
  }).single( keyName );

  return ( req: Request, res: Response, next: NextFunction ) => {
    uploader( req, res,  err => {
      if ( !err ) return next();

      let message = 'Ocurrió un error con el servidor';
      if ( err.code ) {
        const messageFromCode = errorCodeToMessage( err.code );
        if ( messageFromCode ) {
          message = err.code === 'LIMIT_FILE_SIZE' ? `${ messageFromCode }, el límite es de ${ ( fileSize / 1024 ) / 1024 } MB` : messageFromCode;
        }
      } else {
        if ( err.message ) message = err.message
      }

      resHandler({
        codeName: 'uploadFileMiddleware',
        statusCode: err.message ? 409 : 500,
        response: res,
        message,
        error: err as Error
      });
    })
  }
}


export default uploadFile;
