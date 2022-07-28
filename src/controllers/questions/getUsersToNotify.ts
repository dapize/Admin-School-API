import { Types } from 'mongoose';

import tuitionModel, { ITuitionDb } from "../../models/tuition";
import teacherModel, { ITeacherDb } from '../../models/teacher';


const getUsersToNotify = async ( authorId: Types.ObjectId, grade: number , course?: string ): Promise<string[]> => {
  // getting all the student of the grade 'X'
  const docsStudentsIds = await tuitionModel.find(
    {
      grade,
      user: {
        $ne: authorId
      }
    },
    {
      user: true,
      _id: false
    }
  );

  let usersIdsToUpdate: string[] = [];
  if ( docsStudentsIds.length ) {
    // getting the IDs ( in string ) of the students
    const studentsIds = docsStudentsIds.map( ( item: ITuitionDb ) => ( item.user as Types.ObjectId ).toString() );
    usersIdsToUpdate = [ ...studentsIds ];
  }

  // cheking if I need send the notification to the teacher
  if ( course ) {
    const docsTeachersIds = await teacherModel.find(
      {
        grade,
        courses: course,
        user: {
          $ne: authorId
        }
      },
      {
        user: true,
        _id: false
      }
    );
    if ( docsTeachersIds.length ) {
      // getting the IDs of the teachers in string
      const teachersIds = docsTeachersIds.map( ( item: ITeacherDb ) => ( item.user as Types.ObjectId ).toString() );
      usersIdsToUpdate = [ ...usersIdsToUpdate, ...teachersIds ];
    }
  }

  return usersIdsToUpdate;
}

export default getUsersToNotify;

