import validator from '../helpers/validator';

export const newGradeMdwBody = validator(
  {
    name: "string",
    position: "number",
    courses: {
      type: "array",
      items: "string",
      min: 1
    }
  },
  "grades > newGradeMdwBody"
)
