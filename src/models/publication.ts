import { Schema, model } from 'mongoose';

export interface IPublication {
  title: string;
  description: string;
  image: string;
}

const publicationSchema = new Schema<IPublication>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)
const publicationModel = model<IPublication>( 'publications', publicationSchema);

export default publicationModel;
