import { Request, Response, NextFunction } from 'express';
import FastestValidator from 'fastest-validator';
import resHandler, { IDataErrorItem } from './resHandler';

import { IFile } from '../middleware/uploadFile';
import deletingFile from './deletingFile';

type TType = 'body' | 'params' | 'file' | 'query';
interface ISchema {
  [k: string]: Object
}

const validator = ( schema: ISchema, codeName: string, reqType: TType = 'body' ) => {
  const valid = new FastestValidator();
  const check = valid.compile( schema );

  return async (req: Request, res: Response, next: NextFunction) => {

    // cheking if the request have content
    const msgError = `Faltó la propiedad ${ reqType } en la consulta`;
    const dataObj = req[ reqType ];
    if ( !dataObj ) {
      resHandler({
        codeName: codeName,
        statusCode: 409,
        response: res,
        message: msgError,
        error: msgError
      });

      // if the request have a file, I have to delete
      if ( !req.file ) return;
      await deletingFile( <IFile>req.file );

      return;
    }

    // checking the content of the request
    const arrErrorsBody = check( dataObj );
    if ( Array.isArray( arrErrorsBody ) ) {
      resHandler({
        codeName: codeName,
        statusCode: 409,
        response: res,
        errors: arrErrorsBody as IDataErrorItem[]
      })

      // if the request have a file, I have to delete
      if ( !req.file ) return;
      await deletingFile( <IFile>req.file );

      return;
    }

    // finally passing
    next();
  }
}

export default validator;
