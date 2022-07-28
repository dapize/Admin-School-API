import userModel from '../models/user';
import studentModel from '../models/student';
import teacherModel from '../models/teacher';

const getIdByRole = async ( role: string, dni: string ) => {
  let owner: string = '';
  switch ( role ) {
    case 'student':
      const studentData = await studentModel.findOne( { dni } );
      owner = studentData!._id;
      break;

    case 'teacher':
      const teacherData = await teacherModel.findOne( { dni } );
      owner = teacherData!._id;
      break;

    default:
      const adminData = await userModel.findOne( { dni } );
      owner = adminData!._id;
  }
  return owner;
}
export default getIdByRole
