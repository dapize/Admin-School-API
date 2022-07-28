import { Schema, model, Types, PopulatedDoc, Document } from 'mongoose';
import { TSource } from './question';
import { IStudent } from './student';
import { ITeacher } from './teacher';

export interface IAnswer {
  question: string;
  content: string;
  file?: string;
  author: Types.ObjectId;
  source: TSource;
}

export interface IAnswerDb extends Omit<IAnswer, 'author'> {
  _id: Types.ObjectId;
  author: PopulatedDoc<IStudent & ITeacher & Document<Types.ObjectId>> | Types.ObjectId;
  createdAt?: Date
}

const answerSchema = new Schema<IAnswer>(
  {
    question: {
      type: String,
      required: true
    },
    content: {
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
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const answerModel = model<IAnswer>( 'answers', answerSchema );

export default answerModel;
