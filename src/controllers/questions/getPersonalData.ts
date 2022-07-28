import { Types } from 'mongoose';
import { IAuthorPersonalData } from "../../interfaces/author";
import studentModel from "../../models/student";
import teacherModel from "../../models/teacher";

export interface IDataUser extends IAuthorPersonalData {
  _id: Types.ObjectId;
  user?: Types.ObjectId
}

const getPersonalDataByRole = async ( role: string, dni: string ) => {
  let data: Partial<IDataUser> = {};
  switch ( role ) {
    case 'student':
      const studentData = await studentModel.findOne( { dni } );
      if ( studentData ) data = studentData;
      break;

    case 'teacher':
      const teacherData = await teacherModel.findOne( { dni } );
      if ( teacherData ) data = teacherData;
      break;
  }
  return data;
}

export default getPersonalDataByRole;
