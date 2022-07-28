import validator from '../helpers/validator';
import { fileProps } from './uploadFile';

const props = {
  grade: {
    type: "string",
    numeric: true
  },
  course: "string",
  bimester: {
    type: "string",
    numeric: true
  },
  week: {
    type: "string",
    numeric: true
  }
};

export const newMaterialBodyMdw = validator(
  {
    ...props,
    owner: {
      type: "string",
      optional: true
    },
    source:{
      type: "string",
      optional: true
    }
  },
  "material > new[Body]"
)

export const newMaterialFileMdw = validator(
  fileProps,
  "material > new[File]",
  "file"
)

export const materialIdParamsMdw = validator(
  {
    id: "string"
  },
  "material > delete[Params]",
  "params"
)

export const listMaterialsQueryMdl = validator(
  {
    ...props,
    owner: "string"
  },
  "materials > list",
  "query"
)
