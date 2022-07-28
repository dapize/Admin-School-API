import { ICourse } from "../../models/courses";

const getCourseName = ( code: string, coursesList: ICourse[] ): string => {
  const findCourse = coursesList.find( ( course: ICourse ) => course.code === code );
  return findCourse!.name;
}

export default getCourseName;
