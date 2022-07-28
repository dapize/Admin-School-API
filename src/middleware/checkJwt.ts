import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import FastestValidator from 'fastest-validator';

import resHandler, { IDataErrorItem } from '../helpers/resHandler';

const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
  // creating the validator of the authorization
  const validAuthorization = new FastestValidator();
  const checkAuthorization = validAuthorization.compile({
    authorization: {
      type: "string",
      required: true
    }
  });

  // validating the authorization
  const arrErrorsHeaders = checkAuthorization( req.headers );
  if ( Array.isArray( arrErrorsHeaders ) ) {
    resHandler({
      codeName: 'checkJwt',
      statusCode: 409,
      response: res,
      errors: arrErrorsHeaders as IDataErrorItem[]
    });
    return;
  }

  // cheking if the token is valid
  const { authorization } = req.headers;
  const token = <string>authorization?.split(' ').pop();

  try {
    const jwtPayload = <any>jwt.verify(token, `${ process.env.JWT_SECRET }`);
    res.locals.jwtPayload = jwtPayload;
    next();
  } catch ( err ) {
    resHandler({
      codeName: 'checkJwt',
      statusCode: 401,
      response: res,
      message: 'El token es inválido',
      extraSend: {
        tokenExpired: true
      },
      error: err as Error,
    });
  }
};

export default checkJwt;
