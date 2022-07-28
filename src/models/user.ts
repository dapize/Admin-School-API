import { Schema, model } from 'mongoose';
import { notificationRecordSchema, INotificationRecord } from './notification';

export type TUser = 'student' | 'teacher' | 'administrator';

export interface IRevised {
  status: boolean;
  updatedAt: Date;
}

export interface IUserNotifications {
  list: INotificationRecord[];
  revised: IRevised;
}

export interface IUser  {
  name: string;
  dni: string;
  role: TUser;
  password: string;
  notifications: IUserNotifications;
}

export interface IPUser extends Partial<IUser> {}

export interface IUserDb extends IUser {
  _id: string;
  createAt: Date;
}

export interface ILogged {
  id: string;
  name: string;
  role: TUser;
  tokenSession: string;
  grade?: number;
  grades?: number[];
  notifications?: number;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true
    },
    dni: {
      type: String,
      required: true,
      unique: true
    },
    password:  {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    notifications: {
      list: {
        type: [ notificationRecordSchema ],
        default: [],
      },
      revised: {
        status: {
          type: Boolean,
          default: false
        },
        updatedAt: {
          type: Date,
          default: new Date().toISOString()
        }
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const userModel = model<IUser>( 'users', userSchema );

export default userModel;
