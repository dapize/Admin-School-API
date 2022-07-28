import validator from '../helpers/validator';

export const newCourseMdwBody = validator(
  {
    name: "string",
    competencies: {
      type: "array",
      items: "string"
    }
  },
  "courses > newCourseMdwBody"
)
