import { IStudent } from '../models/student';
import { IRepresentative } from '../models/representative';

interface IPStudent extends Partial<IStudent> {}
interface IPRepresentative extends Partial<IRepresentative> {}

interface ITuitionBody {
  studentDni: string;
  studentLastName: string;
  studentSecondLastName: string;
  studentName: string;
  studentCellphone?: number;
  studentInstitutionOrigin: string;
  studentEmail?: string;
  studentGrade: number;
  studentDisease?: string;
  studentDifficulty?: string;
  studentTransferDocument?: string;
  studentTransferDocumentType: number
  representativeDni: string;
  representativeLastName: string;
  representativeSecondLastName: string;
  representativeName: string;
  representativeAddress: string;
  representativeCellphone?: number;
  representativeEmail?: string;
  representativeType: number;
  tuitionCost: number;
  monthlyCost: number;
  observation?: string;
}

interface IRestData {
  institutionOrigin: string;
  grade: number;
  documentTransfer: {
    type: number;
    name?: string;
  };
  cost: number;
  monthly: number;
  observation?: string;
}
export interface IPRestData extends Partial<IRestData>{};

const tuitionData = ( body: ITuitionBody ) => {

  const {
    studentDni,
    studentLastName,
    studentSecondLastName,
    studentName,
    studentCellphone,
    studentInstitutionOrigin,
    studentEmail,
    studentGrade,
    studentDisease,
    studentDifficulty,
    studentTransferDocumentType,
    representativeDni,
    representativeLastName,
    representativeSecondLastName,
    representativeName,
    representativeAddress,
    representativeCellphone,
    representativeEmail,
    representativeType,
    tuitionCost,
    monthlyCost,
    observation
  } = body;

  // getting the student Data
  const student: IPStudent = {};

  if ( studentDni ) student.dni = studentDni
  if ( studentLastName ) student.lastName = studentLastName
  if ( studentSecondLastName ) student.secondLastName = studentSecondLastName
  if ( studentName ) student.name = studentName
  if ( studentCellphone ) student.cellphone = studentCellphone
  if ( studentEmail ) student.email = studentEmail
  if ( studentDisease ) student.disease = studentDisease
  if ( studentDifficulty ) student.difficulty = studentDifficulty

  // getting the representative data
  const representative: IPRepresentative = {};
  if ( representativeDni ) representative.dni = representativeDni;
  if ( representativeLastName ) representative.lastName = representativeLastName;
  if ( representativeSecondLastName ) representative.secondLastName = representativeSecondLastName;
  if ( representativeName ) representative.name = representativeName;
  if ( representativeAddress ) representative.address = representativeAddress;
  if ( representativeCellphone ) representative.cellphone = representativeCellphone;
  if ( representativeEmail ) representative.email = representativeEmail;
  if ( representativeType ) representative.type = representativeType;

  // getting the rest of the data
  const rest:IPRestData = {};
  if ( studentInstitutionOrigin ) rest.institutionOrigin = studentInstitutionOrigin;
  if ( studentGrade ) rest.grade = studentGrade;
  if ( studentTransferDocumentType ) {
    rest.documentTransfer = {
      type: studentTransferDocumentType
    }
  }
  if ( tuitionCost ) rest.cost = tuitionCost;
  if ( monthlyCost ) rest.monthly = monthlyCost;
  if ( observation ) rest.observation = observation;

  return {
    student,
    representative,
    rest
  }
}


export default tuitionData;
