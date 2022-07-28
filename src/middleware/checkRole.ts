import { Request, Response, NextFunction } from 'express';

import userModel from '../models/user';
import resHandler  from '../helpers/resHandler';

const checkRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dni = res.locals.jwtPayload.dni;

    try {
      // finding the user
      const userNotFound = `Usuario con DNI ${ dni } no encontrado`
      const userData = await userModel.findOne({ dni });
      if ( ! userData ) {
        resHandler({
          codeName: 'checkRole',
          statusCode: 401,
          response: res,
          message: userNotFound,
          error: userNotFound as string,
        });
        return;
      }

      // cheking the role
      const role = userData.role;
      if ( roles.includes( role ) ) {
        res.locals.role = role;
        return next()
      }


      // Dont have the correct role
      const notAuthorized = `Usuario con DNI ${ dni } no autorizado`;
      resHandler({
        codeName: 'checkRole',
        statusCode: 401,
        response: res,
        message: notAuthorized,
        error: notAuthorized as string,
      });

    } catch ( err ) {
      const userNotFound = `Usuario con DNI ${ dni } no encontrado`
      resHandler({
        codeName: 'checkRole',
        statusCode: 409,
        response: res,
        message: userNotFound,
        error: userNotFound as string,
      });
    }
  };
};

export default checkRole;
