import { Types, Schema, model, PopulatedDoc, Document } from 'mongoose';
import { IStudent } from './student';

export interface IRecordFind {
  teacher: string;
  course: string;
  grade: number;
  bimester: number;
  year: number;
}

export interface IPRecordFind extends Partial<IRecordFind> {};

export interface ICompetencies {
  c1?: number;
  c2?: number;
  c3?: number;
  c4?: number
}

export interface IObjCompetencies {
  [ course: string ]: ICompetencies
}

export interface IRecord extends IRecordFind {
  student: PopulatedDoc<IStudent & Document<Types.ObjectId>> | Types.ObjectId;
  competencies: ICompetencies;
}

export interface IRecordFilter {
  _id: string;
  course: string;
}

export interface IPRecord extends Partial<IRecord> {}

export interface IRecordItemTemplateRecords {
  competencie: string;
  byBimesters: number[];
}
export interface IRecordItemTemplate {
  course: string;
  records: IRecordItemTemplateRecords[];
  averagesByBimesters?: string[];
  finalRecord?: string;
}

export interface IRecordTemplate {
  name: string;
  dni: string;
  grade: string;
  datePrint: string;
  records: IRecordItemTemplate[];
}

const recordSchema = new Schema<IRecord>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    teacher: {
      type: String,
      required: true
    },
    course: {
      type: String,
      required: true
    },
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 11
    },
    bimester: {
      type: Number,
      required: true
    },
    competencies: {
      c1: {
        type: Number
      },
      c2: {
        type: Number
      },
      c3: {
        type: Number
      },
      c4: {
        type: Number
      }
    },
    year: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const recordModel = model<IRecord>( 'records', recordSchema );

export default recordModel;
