import { Schema, model, Document, PopulatedDoc, Types } from 'mongoose';

import { IAnswer } from './answers';
import { IQuestion } from './question';

export type TNotification = 'question' | 'answer';
export type TRole = 'teacher' | 'student';

export interface INotification {
  type: TNotification;
  question: PopulatedDoc<IQuestion & Document<Types.ObjectId>> | Types.ObjectId;
  answer?: PopulatedDoc<IAnswer & Document<Types.ObjectId>> | Types.ObjectId;
}

export interface INotificationRecord extends Document {
  source: PopulatedDoc<INotification & Document<Types.ObjectId>> | Types.ObjectId | INotification;
  checked: boolean;
  createdAt?: Date;
}

export interface INotificationDb extends INotification, Document {
  _id: Types.ObjectId;
  createdAt?: Date
}

export interface INotificationResponse {
  _id: string
  question: string;
  answer?: string;
  role: TRole;
  grade: number;
  type: TNotification;
  fullName: string;
  checked: boolean;
  source: string;
  createdAt: Date;
}

export const notificationRecordSchema = new Schema<INotificationRecord>(
  {
    source: {
      type: Schema.Types.ObjectId,
      ref: 'notifications'
    },
    checked: {
      type: Boolean,
      required: true
    }
  },
  {
    _id: false,
    timestamps: true,
    versionKey: false
  }
);

const notificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ['question', 'answer'],
      required: true
    },
    question: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'questions'
    },
    answer: {
      type: Schema.Types.ObjectId,
      ref: 'answers'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

const notificationModel = model<INotification>( 'notifications', notificationSchema );

export default notificationModel;
