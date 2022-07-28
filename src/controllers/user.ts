import { Request, Response } from 'express';

import { encrypt, compare } from '../helpers/handleBcrypt';
import resHandler from '../helpers/resHandler';
import getIdByRole from '../helpers/getIdByRole';

import userModel from '../models/user';

export const updatePasswordCtrl = async ( req: Request, res: Response ) => {
  const { role, jwtPayload: { dni } } = res.locals;
  const { oldPassword, newPassword } = req.body;
  const { id } = req.params;

  try {
    let userData = await userModel.findOne({ dni });
    // when user is not found.
    if ( !userData ) {
      const message = `Usuario con DNI ${ dni } no encontrado`;
      resHandler({
        codeName: 'updatePasswordCtrl',
        statusCode: 409,
        message: message,
        error: message as string,
        response: res
      });
      return;
    }

    const idUser = await getIdByRole( role, dni );

    if ( id !== idUser.toString() ) {
      const message = 'No está autorizado para cambiar la contraseña de este usuario';
      resHandler({
        codeName: 'updatePasswordCtrl',
        statusCode: 401,
        message: message,
        error: message as string,
        response: res
      });
      return;
    }

    // user exists lets compare the password passed
    const passwordMatch = await compare( oldPassword, userData.password );
    if ( !passwordMatch ) {
      const message = `La clave antigua para el usuario con DNI ${ dni } no es la correcta`;
      resHandler({
        codeName: 'updatePasswordCtrl',
        statusCode: 409,
        message: message,
        error: message as string,
        response: res
      });
      return;
    };

    // updating the password
    const passwordEncrypted = await encrypt( newPassword );
    await userModel.updateOne( { _id: userData._id }, { password: passwordEncrypted });

    // Finally, all fine
    resHandler({
      statusCode: 200,
      response: res,
      message: '¡Contraseña cambiada con éxito!'
    });

  } catch ( err ) {
    resHandler({
      codeName: 'updatePasswordCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error procesando el cambio de contraseña',
      error: err as Error
    })
  }
}

