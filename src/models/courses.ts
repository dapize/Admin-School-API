import { Schema, model, Document } from 'mongoose';

export interface ICourse extends Document {
  code: string;
  name: string;
  grades: number[];
  competencies: string[];
}

const courseSchema = new Schema<ICourse>(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    competencies: {
      type: [String],
      required: true
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

const courseModel = model<ICourse>( 'courses', courseSchema );

export default courseModel;
