import { Schema, model, Types, PopulatedDoc, Document } from 'mongoose';
import { IStudent } from './student';
import { ITeacher } from './teacher';

export type TSource = 'teachers' | 'students';
export type TTheme = 'general' | 'course';

export interface IQuestion {
  title: string;
  description: string;
  file?: string;
  author: PopulatedDoc<IStudent & ITeacher & Document<Types.ObjectId>> | Types.ObjectId;
  source: TSource;
  grade: number;
  theme: TTheme;
  course?: string;
  answers: number;
}

export interface IQuestionDb extends IQuestion {
  _id: Types.ObjectId;
  createdAt?: Date
}

const questionSchema = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    file: String,
    author: {
      type: Schema.Types.ObjectId,
      refPath: 'source',
      required: true
    },
    source: {
      type: String,
      enum: ['teachers', 'students'],
      required: true
    },
    grade: {
      type: Number,
      required: true
    },
    theme: {
      type: String,
      enum: ['general', 'course'],
      required: true
    },
    course: String,
    answers: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

const questionModel = model<IQuestion>( 'questions', questionSchema );

export default questionModel;
