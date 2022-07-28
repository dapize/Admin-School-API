import { Types, Schema, model } from 'mongoose';
import { IAuthorPersonalData } from '../interfaces/author';

export interface IStudent extends IAuthorPersonalData {
  user: Types.ObjectId;
  dni: string;
  cellphone?: number;
  email?: string;
  disease?: string;
  difficulty?: string;
}

export interface IPStudent extends Partial<IStudent> {};

export interface IStudentDb extends IStudent {
  createAt?: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    dni: {
      type: String,
      minlength: 8,
      maxlength: 8,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 40
    },
    lastName: {
      type: String,
      minlength: 2,
      maxlength: 50,
      required: true
    },
    secondLastName: {
      type: String,
      minlength: 2,
      maxlength: 50,
      required: true
    },
    cellphone: {
      type: Number
    },
    email: {
      type: String,
      maxlength: 77
    },
    disease: {
      type: String,
      maxlength: 100
    },
    difficulty: {
      type: String,
      maxlength: 100
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const studentModel = model<IStudent>( 'students', studentSchema );

export default studentModel;
