import validator from '../helpers/validator';

const props = {
  grade:{
    type: "string",
    numeric: true
  },
  theme: "string",
  course: {
    type: "string",
    optional: true
  }
}

export const newQuestionBodyMdw = validator(
  {
    ...props,
    title: "string",
    description: "string",
  },
  "question > new[Body]"
)

export const listQuestionsQueryMdl = validator(
  {
    ...props
  },
  "questions > list",
  "query"
)

export const idQuestionMdwParams = validator(
  {
    id: "string"
  },
  "questions > updateParams",
  "params"
)

export const updateQuestionMdwBody = validator(
  {
    title: {
      type: "string",
      optional: true
    },
    description: {
      type: "string",
      optional: true
    }
  },
  "questions > updateBody",
)
