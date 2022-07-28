import { Types, Schema, model, Document, PopulatedDoc } from 'mongoose';
import { IStudent } from './student';
import { IUser } from './user';
import { IRepresentative } from './representative';

export interface ITuitionSearch {
  dni?: RegExp;
  lastName?: RegExp;
}

export interface ITuition {
  user: PopulatedDoc<IUser & Document<Types.ObjectId>> | Types.ObjectId;
  student: PopulatedDoc<IStudent & Document<Types.ObjectId>> | Types.ObjectId;
  institutionOrigin: string;
  grade: number;
  documentTransfer: {
    type: number;
    name?: string;
  };
  representative: PopulatedDoc<IRepresentative & Document<Types.ObjectId>> | Types.ObjectId;
  cost: number;
  monthly: number;
  observation?: string;
}

export interface ITuitionDb extends ITuition {
  _id?: Types.ObjectId;
  createdAt?: string;
}

export interface ITuitionResponse {
  _id: string;
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
  createdAt: string;
}

const tuitionSchema = new Schema<ITuition>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'students'
    },
    institutionOrigin: {
      type: String,
      required: true
    },
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 11
    },
    documentTransfer: {
      type: {
        type: Number,
        required: true
      },
      name: {
        type: String
      }
    },
    representative: {
      type: Schema.Types.ObjectId,
      ref: 'representatives'
    },
    cost: {
      type: Number,
      required: true
    },
    monthly: {
      type: Number,
      required: true
    },
    observation: {
      type: String
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)
const tuitionModel = model<ITuition>( 'tuitions', tuitionSchema);

export default tuitionModel;
