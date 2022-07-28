import { Types } from "mongoose";

export interface IAuthorPersonalData {
  _id?: Types.ObjectId;
  name: string;
  lastName: string;
  secondLastName: string;
}
