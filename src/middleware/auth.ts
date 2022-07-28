import validator from "../helpers/validator";

export const loginMdw = validator(
  {
    dni: {
      type: "string",
      length: 8
    },
    password: {
      type: "string"
    }
  },
  "auth > login"
);

export const registerMdw = validator(
  {
    name: {
      type: "string"
    },
    dni: {
      type: "string",
      length: 8
    },
    password: {
      type: "string"
    },
    role: {
      type: "string"
    },
  },
  "auth > register"
);
