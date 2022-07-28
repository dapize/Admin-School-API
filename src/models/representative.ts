import { Schema, model } from 'mongoose';

export interface IRepresentative {
  dni: string;
  name: string;
  lastName: string;
  secondLastName: string;
  cellphone?: number;
  email?: string;
  address: string;
  type: number;
}

const representativeSchema = new Schema<IRepresentative>(
  {
    dni: {
      type: String,
      minlength: 8,
      maxlength: 8,
      required: true
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
    address: {
      type: String,
      required: true
    },
    type: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const representativeModel = model<IRepresentative>( 'representatives', representativeSchema );

export default representativeModel;
