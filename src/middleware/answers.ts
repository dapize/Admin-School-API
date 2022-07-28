import validator from '../helpers/validator';

export const newAnswerBodyMdw = validator(
  {
    question: "string",
    content: "string"
  },
  "answer > new[Body]"
)

export const idMdwParams = validator(
  {
    id: "string"
  },
  "answers > updateParams",
  "params"
)
