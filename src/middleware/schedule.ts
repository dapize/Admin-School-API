import validator from '../helpers/validator';
import { fileProps } from './uploadFile';

export const newAndUpdateScheduleBodyMdw = validator(
  {
    grade: {
      type: "string",
      numeric: true
    },
  },
  "schedule > new[Body]"
)

export const newScheduleFileMdw = validator(
  fileProps,
  "schedule > new[File]",
  "file"
)

export const gradeScheduleMdw = validator(
  {
    grade: {
      type: "string",
      numeric: true
    }
  },
  "schedule > Get & Delete",
  "params"
)
