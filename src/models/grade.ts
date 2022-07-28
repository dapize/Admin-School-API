import { Schema, model } from 'mongoose';

export interface IGrade {
  name: string;
  position: number;
  courses: string[];
}

const gradeSchema = new Schema<IGrade>(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    position: {
      type: Number,
      required: true,
      unique: true
    },
    courses: {
      type: [String],
      required: true
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

const gradeModel = model<IGrade>( 'grades', gradeSchema );

export default gradeModel;
