import { Schema, model } from 'mongoose';
import { IAuthorPersonalData } from '../interfaces/author';

export interface IMaterial {
  file: string;
  owner: string;
  source: 'teacher' | 'student';
  grade: number;
  course: string;
  bimester: number;
  week: number;
}

export interface IMaterialDb extends Omit<IMaterial, 'owner'> {
  _id: string;
  owner: string | IAuthorPersonalData;
  createdAt?: Date;
}

const materialSchema = new Schema<IMaterial>(
  {
    file: {
      type: String,
      required: true
    },
    owner: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    grade: {
      type: Number,
      required: true
    },
    course: {
      type: String,
      required: true
    },
    bimester: {
      type: Number,
      required: true
    },
    week: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

const materialModel = model<IMaterial>( 'materials', materialSchema );

export default materialModel;
