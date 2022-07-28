
import teacherModel from '../../models/teacher';
import recordModel, { IRecord, IObjCompetencies } from '../../models/record';


const recordsCreator = async (
  coursesByGrade: string[],
  grade: number,
  studentId: IRecord['student'],
  objCompetencies: IObjCompetencies
) => {
  // searching teachers
  const findTeachers = coursesByGrade.map( ( course: string ) => {
    return teacherModel.findOne({
      grade,
      courses: course
    }, {
      _id: false,
      createdAt: false,
      updatedAt: false
    })
  })
  const teachersFound = await Promise.all( findTeachers );

  // creating records
  const currentDate = new Date();
  const year = currentDate.getFullYear();

  const records = coursesByGrade.map( ( course: string ) => {
    const teacher = teachersFound.find( ( teacher ) => teacher?.courses.includes( course ));
    if ( !teacher ) return Promise.reject('Teacher not found')
    const arrRecords = [ ...Array(4) ].map( (item: undefined, index: number ) => {
      return {
        student: studentId,
        teacher: teacher?.code as string,
        course,
        grade,
        bimester: index + 1,
        year,
        competencies: objCompetencies[ course ]
      }
    })
    return recordModel.create( arrRecords )
  });

  await Promise.all( records );
}

export default recordsCreator;
