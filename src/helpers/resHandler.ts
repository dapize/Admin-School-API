import { Response } from 'express';
import Logger from 'jet-logger';

export interface IDataErrorItem {
  type: string;
  message: string;
  field: string;
}

interface IContentError {
  errors?: IDataErrorItem[];
  message?: string;
}

interface IDataError extends IContentError {
  codeName?: string;
  response?: Response;
  statusCode?: number;
  error?: Error | string;
  extraSend?: any;
}

const resHandler = ( { codeName, response: res , statusCode, error, errors, message, extraSend }: IDataError ) => {
  if ( codeName ) Logger.Warn('codeName: ' + codeName );
  if ( error ) Logger.Warn( error );

  let objToSend: IContentError = {};
  if ( errors ) {
    objToSend.errors = errors;
    Logger.Warn( JSON.stringify( errors ) );
  }
  if ( message ) objToSend.message = message;
  if ( extraSend ) objToSend = Object.assign(objToSend, extraSend);

  if ( res && statusCode) {
    res.status( statusCode );
    res.send( objToSend );
  }
}

export default resHandler;
