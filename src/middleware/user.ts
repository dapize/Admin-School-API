import validator from "../helpers/validator";

export const updatePasswordMdw = validator(
  {
    oldPassword: "string",
    newPassword: "string"
  },
  "user > updatePassword"
);
