import validator from '../helpers/validator';

export const idMdwParams = validator(
  {
    id: "string"
  },
  "notifications > id",
  "params"
)

export const limitNotificationsMdl = validator(
  {
    limit: {
      type: "string",
      numeric: true,
      optional: true
    }
  },
  "notifications > limitNotifications",
  "query"
)
