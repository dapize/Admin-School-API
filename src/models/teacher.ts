import { Types, Schema, model } from 'mongoose';
import { IAuthorPersonalData } from '../interfaces/author';

export interface ITeacher extends IAuthorPersonalData {
  user: Types.ObjectId;
  code: string;
  dni: string;
  speciality: string;
  address: string;
  cellphone?: number;
  email?: string;
  grades: number[];
  courses: string[];
}

export interface ITeacherDb extends ITeacher {
  createdAt?: Date;
  updatedAt?: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    dni: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    secondLastName: {
      type: String,
      required: true
    },
    speciality: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    cellphone: {
      type: Number
    },
    email: {
      type: String
    },
    grades: {
      type: [Number],
      required: true
    },
    courses: {
      type: [String],
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)
const teacherModel = model<ITeacher>( 'teachers', teacherSchema);

export default teacherModel;
