import path from 'path';
import fs from 'fs/promises';
import { Request, Response } from 'express';
import { Types, Document } from 'mongoose';

import resHandler from '../../helpers/resHandler';
import { encrypt } from '../../helpers/handleBcrypt';
import tuitionData, { IPRestData } from '../../helpers/tuitionData';
import beautifulCost from '../../helpers/beautifulCost';
import pdfResponse from '../../helpers/pdfResponse';
import fieldsToRemove from '../../helpers/fieldsToRemove';

import {
  representative as toRepresentative,
  documentTransferType as toDocTransType,
  grade as toGrade
} from '../../utils/numberTo';
import readableDate from '../../utils/readableDate';

import { IFile } from '../../middleware/uploadFile';
import paths from '../../config/paths';

import tuitionModel, { ITuitionSearch, ITuitionResponse, ITuitionDb } from '../../models/tuition';
import userModel, { IPUser } from '../../models/user';
import studentModel, { IStudentDb, IStudent } from '../../models/student';
import representativeModel, { IRepresentative } from '../../models/representative';
import gradeModel from '../../models/grade';
import recordModel, { IRecordFilter  } from '../../models/record';
import questionModel from '../../models/question';
import answerModel from '../../models/answers';

import recordsCreator from './recordsCreator';
import getCompetencies from './competencies';

import deleteFileUploaded from './deleteFileUploaded';


export const newTuitionCtrl = async ( req: Request, res: Response ) => {
  const { student, representative, rest } = tuitionData( req.body );
  const grade = rest.grade;
  const reqFile = <IFile>req.file;
  const file = reqFile ? reqFile.filename : '';

  try {

    // creating the user with role student
    const studentDni = student.dni as string;
    const password = await encrypt( studentDni);
    const { _id: userId } = await userModel.create({
      name: student.name as string,
      dni: studentDni,
      password,
      role: 'student'
    });

    // creating the student
    const { _id: studentId } = await studentModel.create({
      ...student,
      user: userId
    });

    // creating the representative
    const { _id: representativeId } = await representativeModel.create( representative );

    // tuition Vault
    const tuition: IPRestData = {
      ...rest
    };

    // checking if was sended a file
    if ( file && tuition.documentTransfer ) tuition.documentTransfer.name = file;

    // creating the tuition
    const { _id: tuitionId } = await tuitionModel.create({
      ...tuition,
      student: studentId,
      representative: representativeId,
      user: userId
    });

    // searching the course
    const coursesGrade = await gradeModel.findOne({ position: grade }, { courses: true });
    if ( !coursesGrade ) {
      const infoMsg = 'No se encontrarón los cursos asociados a ese grado';
      resHandler({
        codeName: 'newTuitionCtrl',
        statusCode: 409,
        response: res,
        message: infoMsg,
        error: infoMsg
      })
      return;
    }

    // getting the competencies
    const competencies = await getCompetencies();

    // Creating records
    await recordsCreator( coursesGrade.courses, grade as number, studentId, competencies );

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Matrícula registrada con éxito',
      extraSend: {
        _id: tuitionId
      }
    })

  } catch ( err ) {
    if ( file ) await deleteFileUploaded( file );

    resHandler({
      codeName: 'newTuitionCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error procesando la nueva matrícula',
      error: err as Error
    })
  }
}

export const tuitionsListCtrl = async ( req: Request, res: Response ) => {
  const { studentDni, studentLastName } = req.query;

  // filter to search the students
  const filter: ITuitionSearch = {};
  if ( studentDni ) filter.dni = new RegExp( studentDni as string, 'i' );
  if ( studentLastName ) filter.lastName = new RegExp( studentLastName as string, 'i' );

  try {
    // searching the student associated with the tuition
    const studentList: IStudentDb[] = await studentModel.find( filter, { updatedAt: false, createdAt: false } );
    if ( !studentList.length ) {
      resHandler({
        statusCode: 200,
        response: res,
        extraSend: {
          list: []
        }
      })
      return;
    }

    // searching the tuitions by ID Students
    const searchingTuitions = studentList.map( ( student: IStudentDb ) => {
      return tuitionModel
        .findOne({ student: student._id }, { updatedAt: false })
        .populate({
          path: 'student',
          model: studentModel,
          select: '-_id -createdAt -updatedAt -user'
        })
        .populate({
          path: 'representative',
          model: representativeModel,
          select: '-_id -createdAt -updatedAt'
        })
    });
    const tuitionsListPromises = await Promise.all( searchingTuitions );

    // normalizating the tuitions list
    const tuitionsList = tuitionsListPromises.map( tuitionItemVar => {
      const tuitionItem = tuitionItemVar as ITuitionDb;
      const studentItem = tuitionItem!.student as IStudent;
      const representativeItem = tuitionItem!.representative as IRepresentative;

      const tuitionObj: ITuitionResponse = {
        _id: tuitionItem._id?.toString() as string,
        studentDni: studentItem.dni,
        studentLastName: studentItem.lastName,
        studentSecondLastName: studentItem.secondLastName,
        studentName: studentItem.name,

        representativeDni: representativeItem.dni,
        representativeLastName: representativeItem.lastName,
        representativeSecondLastName: representativeItem.secondLastName,
        representativeName: representativeItem.name,
        representativeAddress: representativeItem.address,
        representativeType: representativeItem.type,

        studentInstitutionOrigin: tuitionItem.institutionOrigin,
        studentGrade: tuitionItem.grade,
        studentTransferDocumentType: tuitionItem.documentTransfer.type,
        tuitionCost: tuitionItem.cost,
        monthlyCost: tuitionItem.monthly,
        createdAt: tuitionItem.createdAt as string
      }

      if ( tuitionItem.documentTransfer.name ) tuitionObj.studentTransferDocument = tuitionItem.documentTransfer.name;
      if ( tuitionItem.observation ) tuitionObj.observation = tuitionItem.observation;

      if ( studentItem.cellphone ) tuitionObj.studentCellphone = studentItem.cellphone;
      if ( studentItem.email ) tuitionObj.studentEmail = studentItem.email;
      if ( studentItem.disease ) tuitionObj.studentDisease = studentItem.disease;
      if ( studentItem.difficulty ) tuitionObj.studentDifficulty = studentItem.difficulty;

      if ( representativeItem.cellphone ) tuitionObj.representativeCellphone = representativeItem.cellphone;
      if ( representativeItem.email ) tuitionObj.representativeEmail = representativeItem.email;

      return tuitionObj
    })

    resHandler({
      statusCode: 200,
      response: res,
      extraSend: {
        list: tuitionsList
      }
    })

  } catch ( err ) {
    resHandler({
      codeName: 'tuitionsListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de matrículas',
      error: err as Error
    })
  }
}

export const deleteTuitionCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  try {

    // getting the ID of the user associated
    const findTuition = await tuitionModel.findById( id );
    if ( !findTuition ) {
      const notFound = 'No fué posible encontrar la matrícula con el ID: ' + id;
      resHandler({
        codeName: 'deleteTuitionCtrl',
        statusCode: 409,
        response: res,
        message: notFound,
        error: notFound
      })
      return;
    }

    // dates of the collections associated
    const { representative: representativeId, student: studentId } = findTuition;

    // deleting student associated
    const findStudent = await studentModel.findById( studentId );
    if ( !findStudent ) {
      const notFound = 'No fué posible encontrar el estudiante con el ID: ' + id;
      resHandler({
        codeName: 'deleteTuitionCtrl',
        statusCode: 409,
        response: res,
        message: notFound,
        error: notFound
      })
      return;
    }
    await studentModel.deleteOne({ _id: studentId as Types.ObjectId });

    // deleting the user associated to the student
    await userModel.deleteOne({ _id: findStudent.user });

    // deleting the representative associated
    await representativeModel.deleteOne({ _id: representativeId });

    // deleting the records associated
    await recordModel.deleteMany({ student: ( studentId as Types.ObjectId ) });

    // deleting the questions and anwers associated
    await questionModel.deleteMany({ author: ( studentId as Types.ObjectId ).toString() });
    await answerModel.deleteMany({ author: ( studentId as Types.ObjectId ).toString() });

    // deleting the document associated
    const fileName = findTuition.documentTransfer.name;
    if ( fileName ) await deleteFileUploaded( fileName );

    // finally deleting the tuition
    const tuitionDeleted = await tuitionModel.deleteOne({ _id: id });

    if ( !tuitionDeleted.deletedCount ) {
      const notDeleted = 'No fué posible borrar la matrícula con el ID: ' + id;
      resHandler({
        codeName: 'deleteTuitionCtrl',
        statusCode: 409,
        response: res,
        message: notDeleted,
        error: notDeleted
      })
      return;
    }

    resHandler({
      statusCode: 200,
      response: res,
      message: 'Matrícula eliminada con éxito'
    })
  } catch ( err ) {
    resHandler({
      codeName: 'deleteTuitionCtrl',
      statusCode: 409,
      response: res,
      message: 'Ocurrió un error borrando la docente con ID: ' + id,
      error: err as Error
    })
  }
}

export const resetTuitionCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;

  try {
    const findTuition = await tuitionModel.findById( id );
    if ( !findTuition ) {
      const notFound = 'No fué posible encontrar la matrícula con el ID: ' + id;
      resHandler({
        codeName: 'resetTuitionCtrl',
        statusCode: 409,
        response: res,
        message: notFound,
        error: notFound
      })
      return;
    }

    // changing the password of the user
    const userId = findTuition.user;
    const userData = await userModel.findById( userId );
    const dni = userData?.dni;
    const password = await encrypt( dni as string );
    await userModel.updateOne( { dni }, { password } );
    resHandler({
      statusCode: 200,
      response: res,
      message: `¡La clave del usuario con el DNI ${ dni } fué reseteada con éxito!`
    })

  } catch ( err ) {
    resHandler({
      codeName: 'resetTuitionCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al procesar el reseteo de la password del usuario.',
      error: err as Error
    })
  }
}

export const tuitionReportCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;

  try {
    const findTuition = await tuitionModel
      .findById( id )
      .populate({
        path: 'student',
        model: studentModel,
        select: '-_id -createdAt -updatedAt -user'
      })
      .populate({
        path: 'representative',
        model: representativeModel,
        select: '-_id -createdAt -updatedAt'
      });
    if ( !findTuition ) {
      const notFound = 'No fué posible encontrar la matrícula con el ID: ' + id;
      resHandler({
        codeName: 'tuitionReportCtrl',
        statusCode: 409,
        response: res,
        message: notFound,
        error: notFound
      })
      return;
    }

    const tuitionFound = findTuition as ITuitionDb;
    const student = tuitionFound.student! as IStudent;
    const representative = tuitionFound.representative! as IRepresentative;

    const dataValues = {
      regDate: readableDate( tuitionFound.createdAt ),
      studentDni: student.dni,
      studentGrade: toGrade( tuitionFound.grade ),
      studentEmail: student.email,
      studentLastName: student.lastName,
      studentSecondLastName: student.secondLastName,
      studentName: student.name,
      studentCellphone: student.cellphone || '',
      studentInstitutionOrigin: tuitionFound.institutionOrigin,
      representativeDni: representative.name,
      representativeAddress: representative.address,
      representativeEmail: representative.email || '',
      representativeLastName: representative.lastName,
      representativeSecondLastName: representative.secondLastName,
      representativeName: representative.name,
      representativeCellphone: representative.cellphone || '',
      representativeType: toRepresentative( representative.type ),
      studentTransferDocumentType: toDocTransType( tuitionFound.documentTransfer.type ),
      tuitionCost: beautifulCost( tuitionFound.cost ),
      monthlyCost: beautifulCost( tuitionFound.monthly ),
      observation: tuitionFound.observation,
      printDate: readableDate()
    }

    // creating the PDF
    const template = await fs.readFile( paths.templates.tuition , 'utf8');

    await pdfResponse({
      output: path.join( paths.downloads, `matricula-${ id }.pdf`),
      values: dataValues,
      res,
      template
    });

  } catch ( err ) {
    resHandler({
      codeName: 'tuitionReportCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al procesar la creación del reporte.',
      error: err as Error
    })
  }
}

export const updateTuitionCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  const { student, representative, rest } = tuitionData( req.body );

  // tuition Vault
  const tuition: IPRestData = {
    ...rest
  };

  // checking if was sended a file
  const reqFile = <IFile>req.file;
  const file = reqFile ? reqFile.filename : '';

  if ( file ) tuition.documentTransfer!.name = file;

  try {
    const findTuition = await tuitionModel.findOne( { _id: id } );
    if ( !findTuition ) {
      const notFound = 'No fué posible encontrar la matrícula con el ID: ' + id;
      resHandler({
        codeName: 'deleteTuitionCtrl',
        statusCode: 409,
        response: res,
        message: notFound,
        error: notFound
      });

      // deleting the file that was uploaded
      const newFileName = tuition.documentTransfer!.name;
      if ( newFileName ) await deleteFileUploaded( newFileName );

      return;
    }

    // deleting the old image / document
    const currentFileName = findTuition.documentTransfer.name;
    if ( file ) {
      if ( currentFileName ) await deleteFileUploaded( currentFileName );
    } else {
      if ( currentFileName ) tuition.documentTransfer!.name = currentFileName;
    }

    // updating the students fields
    const studentsFieldsToRemove = fieldsToRemove( student, ['cellphone', 'email', 'disease', 'difficulty'] );
    await studentModel.updateOne( { _id: findTuition.student as Types.ObjectId }, {
      ...student,
      $unset: studentsFieldsToRemove
    });

    // updating the representative fields
    const representativeFieldsToRemove = fieldsToRemove( representative, ['cellphone', 'email'] );
    await representativeModel.updateOne( { _id: findTuition.representative }, {
      ...representative,
      $unset: representativeFieldsToRemove
    });

    // updating the user vinculated
    const newUserData: IPUser = {};
    if ( student.dni ) newUserData.dni = student.dni;
    if ( student.name ) newUserData.name = student.name;
    if ( Object.keys( newUserData ).length ) await userModel.updateOne({ _id: findTuition.user }, newUserData );

    // updating the records
    if ( tuition.grade && tuition.grade !== findTuition.grade ) {

      // searching the course
      const coursesGrade = await gradeModel.findOne({ position: tuition.grade }, { courses: true });
      if ( !coursesGrade ) {
        const infoMsg = 'No se encontrarón los cursos asociados a ese grado';
        resHandler({
          codeName: 'updateTuitionCtrl',
          statusCode: 409,
          response: res,
          message: infoMsg,
          error: infoMsg
        })
        return;
      }

      // getting the current records
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const records = await recordModel.find({
        student: findTuition.student,
        year
      }, {
        course: true,
        _id: true
      } );
      if ( !records.length ) {
        const notFoundRecords = 'No fué posible encontrar las calificaciones asociadas a la matrícula con el ID: ' + id;
        resHandler({
          codeName: 'deleteTuitionCtrl',
          statusCode: 409,
          response: res,
          message: notFoundRecords,
          error: notFoundRecords
        });
        return;
      }

      // deleting the records dont associated to the new grade
      const recordsToRemove = records
        .filter( (record: IRecordFilter) => !coursesGrade.courses.includes( record.course ))
        .map( (record: IRecordFilter) => record._id );
      if ( recordsToRemove.length ) {
        await recordModel.deleteMany({
          _id: {
            $in: recordsToRemove
          }
        });
      }

      // updating the grade of the records
      const recordsToUpdate = records
        .filter( (record: IRecordFilter) => coursesGrade.courses.includes( record.course ))
        .map( (record: IRecordFilter) => record._id );

      if ( recordsToUpdate.length ) {
        await recordModel.updateMany({
          _id: {
            $in: recordsToUpdate
          }
        }, {
          grade: tuition.grade
        });
      }

      // adding the new records associated to the grade
      const currentCoursesRecords = records.map( (record: IRecordFilter) => record.course );
      const coursesToAdd = coursesGrade.courses.filter( ( course: string ) => !currentCoursesRecords.includes( course ));
      if ( coursesToAdd.length ) {
        // getting the competencies
        const competencies = await getCompetencies();
        await recordsCreator( coursesToAdd, tuition.grade, findTuition!.student, competencies );
      }
    }

    // updating the tuition main fields
    const restFieldsToRemove = fieldsToRemove( rest, ['observation'] );
    await tuitionModel.updateOne({ _id: id }, {
      ...rest,
      $unset: restFieldsToRemove
    });

    resHandler({
      statusCode: 200,
      response: res,
      message: '¡Matrícula actualizada con éxito!'
    })

  } catch ( err ) {
    if ( file ) await deleteFileUploaded( file );

    resHandler({
      codeName: 'updateTuitionCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al procesar la actualización de la matrí­cula.',
      error: err as Error
    })
  }
}
