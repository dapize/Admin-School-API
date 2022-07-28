import validator from '../helpers/validator';

export const listRecordsMdl = validator(
  {
    teacher: "string",
    course: "string",
    grade: {
      type: "string",
      numeric: true
    },
    bimester: {
      type: "string",
      numeric: true
    },
    year: {
      type: "string",
      numeric: true
    }
  },
  "records > list",
  "query"
)

export const listMyRecordsMdl = validator(
  {
    year: {
      type: "string",
      numeric: true
    }
  },
  "myRecords > listMyRecordsMdl",
  "query"
)


export const idRecordMdl = validator(
  {
    id: "string"
  },
  "records > idRecord",
  "params"
)

export const idStudentMdl = validator(
  {
    id: "string"
  },
  "records > idStudent",
  "params"
)

export const competencieMdl = validator(
  {
    c1: {
      type: "number",
      integer: true,
      optional: true
    },
    c2: {
      type: "number",
      integer: true,
      optional: true
    },
    c3: {
      type: "number",
      integer: true,
      optional: true
    },
    c4: {
      type: "number",
      integer: true,
      optional: true
    },
  },
  "records > competencie",
)
