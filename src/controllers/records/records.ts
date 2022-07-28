import path from 'path';
import fs from 'fs/promises';
import { Request, Response } from 'express';

import recordModel, { IPRecordFind, ICompetencies, IRecordItemTemplate, IRecord, IRecordItemTemplateRecords } from '../../models/record';
import studentModel from '../../models/student';
import courseModel, { ICourse } from '../../models/courses';
import paths from '../../config/paths';

import resHandler from '../../helpers/resHandler';
import { competenciesParser, competenciesAverage } from './helpers';
import pdfResponse from '../../helpers/pdfResponse';

import { grade as toGrade } from '../../utils/numberTo';
import readableDate from '../../utils/readableDate';

export const recordsListCtrl = async ( req: Request, res: Response ) => {
  const { teacher, grade, course, bimester, year } = req.query;

  const filter: IPRecordFind = {};
  if ( teacher ) filter.teacher = teacher as string;
  if ( grade ) filter.grade = Number( grade );
  if ( course ) filter.course = course as string;
  if ( bimester ) filter.bimester = Number( bimester );
  if ( year ) filter.year = Number( year );

  try {
    // getting the numbers of competencies
    let recordsList = await recordModel
      .find( filter, {
        createdAt: false,
        updatedAt: false,
        teacher: false,
        course: false,
        grade: false,
        bimester: false,
        year: false
      })
      .populate({
        path: 'student',
        model: studentModel,
        select: 'dni name lastName secondLastName'
      })
      .exec();

    resHandler({
      statusCode: 200,
      response: res,
      extraSend: {
        list: recordsList
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'recordsListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de calificaciones',
      error: err as Error
    })
  }
}

export const myRecordsListCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params; // idStudent
  const { year } = req.query;

  try {
    let list = await recordModel
      .find({
          student: id as string,
          year: Number( year ) as number
        },{
          _id: false,
          bimester: true,
          competencies: true,
          course: true
        }
      );

    resHandler({
      statusCode: 200,
      response: res,
      extraSend: {
        list
      }
    })
  } catch ( err ) {
    resHandler({
      codeName: 'myRecordsListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de calificaciones',
      error: err as Error
    })
  }
}

export const updateCompetencieCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params;
  const { c1, c2, c3, c4 } = req.body;

  const newCompetencies: ICompetencies = {};
  if ( c1 !== undefined ) newCompetencies.c1 = c1;
  if ( c2 !== undefined ) newCompetencies.c2 = c2;
  if ( c3 !== undefined ) newCompetencies.c3 = c3;
  if ( c4 !== undefined ) newCompetencies.c4 = c4;

  try {
    const recordFind = await recordModel.findById( id );
    if ( !recordFind ) {
      const notFoundRecord = 'No fué posible encontrar la calificación con el ID: ' + id;
      resHandler({
        codeName: 'updateCompetencieCtrl',
        statusCode: 409,
        response: res,
        message: notFoundRecord,
        error: notFoundRecord
      })
      return;
    }

    await recordModel.updateOne({ _id: id }, { competencies: {
      ...recordFind.competencies,
      ...newCompetencies
    } });

    resHandler({
      statusCode: 200,
      response: res,
      message: '¡Calificación actualizada con éxito!',
    })
  } catch ( err ) {
    resHandler({
      codeName: 'recordsListCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al obtener la lista de calificaciones',
      error: err as Error
    })
  }
}

export const recordsReportCtrl = async ( req: Request, res: Response ) => {
  const { id } = req.params; // idStudent

  try {

    // getting the records
    const findRecord = await recordModel.find({ student: id }, {
      _id: false,
      teacher: false,
      year: false,
      createdAt: false,
      updatedAt: false,
      student: false
    });
    if ( !findRecord.length ) {
      const notFound = 'No fué posible encontrar las calificaciones del estudiante con ID: ' + id;
      resHandler({
        codeName: 'recordsReportCtrl',
        statusCode: 409,
        response: res,
        message: notFound,
        error: notFound
      })
      return;
    }

    // getting the courses and competencies
    const coursesAndCompetencies = await courseModel.find({}, { _id: false });

    // getting the data of the student
    const studentData = await studentModel.findById( id, {
      dni: true,
      name: true,
      lastName: true,
      secondLastName: true
    });

    // building full name
    const studentFullName = `${ studentData!.lastName } ${ studentData!.secondLastName } ${ studentData!.name }`;

    // geting the student DNI;
    const studentDni = studentData!.dni;

    // grade of the student
    const studentGrade = toGrade( findRecord[0].grade );

    // Building the master arry
    let recordsList: IRecordItemTemplate[] = [];
    findRecord.forEach( ( record: IRecord ) => {
      const { competencies: competenciesList } = <ICourse>coursesAndCompetencies.find( ( iCourseCompe: ICourse ) => iCourseCompe.code === record.course );
      const recordRegisteredIndex = recordsList.findIndex( ( iRegRecord: IRecordItemTemplate ) => iRegRecord.course === record.course );

      if ( recordRegisteredIndex == -1) { // is not registered yet
        recordsList.push({
          course: record.course,
          records: competenciesList.map( (competencie: string, index: number ) => {
            const arrRecordsByBimesters: number[] = [];
            arrRecordsByBimesters[ record.bimester - 1 ] = competenciesParser( record.competencies, competenciesList.length )[ index ];
            return {
              competencie,
              byBimesters: arrRecordsByBimesters
            }
          })
        })
      } else {
        const arrRecords = recordsList[ recordRegisteredIndex ].records;
        recordsList[ recordRegisteredIndex ].records = arrRecords.map( ( recordItem: IRecordItemTemplateRecords, index: number ) => {
          const newByBimesters = [ ...recordItem.byBimesters ];
          newByBimesters[ record.bimester - 1 ] = competenciesParser( record.competencies, competenciesList.length )[ index ];
          return {
            competencie: recordItem.competencie,
            byBimesters: newByBimesters
          }
        })
      }
    });
    recordsList = recordsList.map( ( recordItem: IRecordItemTemplate ) => {
      const averagesByBimesters = [ ...Array( 4 ) ].map( ( item: undefined, index: number ) => {
        const recordsByBimester = recordItem.records.map( ( itemB: IRecordItemTemplateRecords ) => itemB.byBimesters[ index ]);
        return competenciesAverage( recordsByBimester )
      })
      const finalRecord = competenciesAverage( averagesByBimesters );
      return {
        ...recordItem,
        averagesByBimesters: averagesByBimesters.map( (averageItem : number ) => averageItem ? `${ averageItem }` : '' ),
        finalRecord: `${ ( finalRecord || '' ) }`
      }
    });

    // creating the PDF
    const template = await fs.readFile( paths.templates.records , 'utf8');

    await pdfResponse({
      output: path.join( paths.downloads, `calificaciones-${ id }.pdf`),
      values: {
        dni: studentDni,
        fullName: studentFullName,
        grade: studentGrade,
        records: recordsList,
        printDate: readableDate()
      },
      res,
      template
    });

  } catch ( err ) {
    resHandler({
      codeName: 'recordsReportCtrl',
      statusCode: 500,
      response: res,
      message: 'Ocurrió un error al procesar la creación de las calificaciones.',
      error: err as Error
    })
  }
}
