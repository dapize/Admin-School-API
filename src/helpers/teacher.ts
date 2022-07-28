import { ITeacherDb } from "../models/teacher";

interface IPTeacherDb extends Partial<ITeacherDb> {
  regDate?: string;
  printDate?: string;
};

const teacherData = ( body: IPTeacherDb ) => {
  const {
    _id,
    dni,
    name,
    lastName,
    secondLastName,
    speciality,
    address,
    cellphone,
    email,
    grades,
    courses,
    createdAt,
    updatedAt
  } = body;

  const newData:IPTeacherDb = {};

  if ( _id ) newData._id = _id;
  if ( dni ) newData.dni = dni;
  if ( name ) newData.name = name;
  if ( lastName ) newData.lastName = lastName;
  if ( secondLastName ) newData.secondLastName = secondLastName;
  if ( speciality ) newData.speciality = speciality;
  if ( address ) newData.address = address;
  if ( cellphone ) newData.cellphone = cellphone;
  if ( email ) newData.email = email;
  if ( grades ) newData.grades = grades;
  if ( courses ) newData.courses = courses;
  if ( createdAt ) newData.createdAt = createdAt;
  if ( updatedAt ) newData.updatedAt = updatedAt;

  return newData;
}

export default teacherData;
