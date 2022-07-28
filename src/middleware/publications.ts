import validator from '../helpers/validator';
import { fileProps } from './uploadFile';

export const newPublicationBodyMdw = validator(
  {
    title: "string",
    description: "string"
  },
  "publications > new[Body]"
)

export const newPublicationFileMdw = validator(
  fileProps,
  "publications > new[File]",
  "file"
)

export const deletePublicationMdw = validator(
  {
    id: "string"
  },
  "publications > delete",
  "params"
)

export const updatePublicationMdwParams = validator(
  {
    id: "string"
  },
  "publications > updateParams",
  "params"
)

export const updatePublicationMdwBody = validator(
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
  "publications > updateBody",
)
