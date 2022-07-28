import validator from '../helpers/validator';

export const newTeacherMdwBody = validator(
  {
    dni: {
      type: "string",
      length: 8
    },
    name: "string",
    lastName: "string",
    secondLastName: "string",
    speciality: "string",
    address: "string",
    cellphone: {
      type: "number",
      min: 900000000,
      max: 999999999,
      optional: true
    },
    email: {
      type: "email",
      optional: true
    },
    grades: {
      type: "array",
      items: "number"
    },
    courses: {
      type: "array",
      items: "string"
    }
  },
  "teachers > new"
)

export const idTeacherMdwParams = validator(
  {
    id: "string"
  },
  "teachers > delete | reset | update",
  "params"
)

export const updateTeacherMdwBody = validator(
  {
    dni: {
      type: "string",
      length: 8,
      optional: true
    },
    name: {
      type: "string",
      optional: true
    },
    lastName: {
      type: "string",
      optional: true
    },
    secondLastName: {
      type: "string",
      optional: true
    },
    speciality: {
      type: "string",
      optional: true
    },
    address: {
      type: "string",
      optional: true
    },
    cellphone: {
      type: "number",
      min: 900000000,
      max: 999999999,
      optional: true
    },
    email: {
      type: "email",
      optional: true
    },
    grades: {
      type: "array",
      items: "number",
      optional: true
    },
    courses: {
      type: "array",
      items: "string",
      optional: true
    }
  },
  "teachers > update",
)
