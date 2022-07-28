import { Schema, model } from 'mongoose';

export interface ISchedule {
  grade: number;
  image: string;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    grade: {
      type: Number,
      required: true,
      unique: true
    },
    image: {
      type: String,
      required: true
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
)
const scheduleModel = model<ISchedule>( 'schedules', scheduleSchema);

export default scheduleModel;
