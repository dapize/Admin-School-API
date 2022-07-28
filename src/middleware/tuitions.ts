import path from 'path';
import fs from 'fs/promises';

import { Request, Response, NextFunction } from 'express';

import resHandler from '../helpers/resHandler';
import validator from '../helpers/validator';
import userModel from '../models/user';
import { IFile } from './uploadFile';


export const idTuitionMdw = validator(
  {
    id: "string"
  },
  "tuitions > delete | reset | report",
  "params"
)

export const newTuitionParamsMdw = validator(
  {
    studentDni: {
      type: "string",
      length: 8
    },
    studentLastName: "string",
    studentSecondLastName: "string",
    studentName: "string",
    studentCellphone: {
      type: "string",
      length: 9,
      numeric: true,
      optional: true
    },
    studentInstitutionOrigin: "string",
    studentEmail: {
      type: "email",
      optional: true
    },
    studentGrade: {
      type: "string",
      numeric: true
    },
    studentDisease: {
      type: "string",
      optional: true
    },
    studentDifficulty: {
      type: "string",
      optional: true
    },
    studentTransferDocumentType: {
      type: "string",
      numeric: true,
      length: 1
    },
    representativeDni: {
      type: "string",
      length: 8
    },
    representativeLastName: "string",
    representativeSecondLastName: "string",
    representativeName: "string",
    representativeAddress: "string",
    representativeCellphone: {
      type: "string",
      numeric: true,
      length: 9,
      optional: true
    },
    representativeEmail: {
      type: "email",
      optional: true
    },
    representativeType: {
      type: "string",
      numeric: true,
      length: 1
    },
    tuitionCost: {
      type: "string",
      numeric: true,
      max: 7
    },
    monthlyCost: {
      type: "string",
      numeric: true,
      max: 7
    },
    observation: {
      type: "string",
      optional: true
    }
  },
  "tuitions > new[Body]"
)

export const existingUser = async (req: Request, res: Response, next: NextFunction) => {
  const { studentDni } = req.body;

  try {
    const findOneStudent = await userModel.findOne({ dni: studentDni }, { _id: true });
    if ( findOneStudent ) {

      // deleting the document saved
      const file = <IFile>req.file;
      if ( file ) {
        const { path: documentUploaded } = file
        const pathDocument = path.join(path.resolve('./'), documentUploaded);
        await fs.unlink( pathDocument );
      }

      // resolving the request
      const message = `Ya existe un estudiante registrado con el DNI ${ studentDni }`;
      resHandler({
        codeName: 'existingUserMdw',
        statusCode: 409,
        message: message,
        error: message as string,
        response: res,
        extraSend: {
          id: findOneStudent._id // to show a modal in the front with the data of the user already registered
        }
      })
    } else {
      next();
    }
  } catch ( err ) {
    resHandler({
      codeName: 'existingUserMdw',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error procesando la nueva matrícula',
      error: err as Error
    })
  }
}

export const updateTuitionParamsMdw = validator(
  {
    id: "string"
  },
  "Tuition > updateParams",
  "params"
)

export const updateTuitionMdwBody = validator(
  {
    studentDni: {
      type: "string",
      length: 8,
      optional: true
    },
    studentLastName: {
      type: "string",
      optional: true
    },
    studentSecondLastName: {
      type: "string",
      optional: true
    },
    studentName: {
      type: "string",
      optional: true
    },
    studentCellphone: {
      type: "string",
      length: 9,
      numeric: true,
      optional: true
    },
    studentInstitutionOrigin: {
      type: "string",
      optional: true
    },
    studentEmail: {
      type: "email",
      optional: true
    },
    studentGrade: {
      type: "string",
      optional: true,
      numeric: true
    },
    studentDisease: {
      type: "string",
      optional: true
    },
    studentDifficulty: {
      type: "string",
      optional: true
    },
    studentTransferDocumentType: {
      type: "string",
      numeric: true,
      length: 1,
      optional: true
    },
    representativeDni: {
      type: "string",
      length: 8,
      optional: true
    },
    representativeLastName: {
      type: "string",
      optional: true
    },
    representativeSecondLastName: {
      type: "string",
      optional: true
    },
    representativeName: {
      type: "string",
      optional: true
    },
    representativeAddress: {
      type: "string",
      optional: true
    },
    representativeCellphone: {
      type: "string",
      numeric: true,
      length: 9,
      optional: true
    },
    representativeEmail: {
      type: "email",
      optional: true
    },
    representativeType: {
      type: "string",
      numeric: true,
      length: 1,
      optional: true
    },
    tuitionCost: {
      type: "string",
      numeric: true,
      max: 7,
      optional: true
    },
    monthlyCost: {
      type: "string",
      numeric: true,
      max: 7,
      optional: true
    },
    observation: {
      type: "string",
      optional: true
    }
  },
  "Tuition > updateBody",
)
