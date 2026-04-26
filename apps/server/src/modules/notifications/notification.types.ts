import { builder } from "../../app/builder";

export const NotificationFilterInput = builder.inputType(
  "NotificationFilterInput",
  {
    fields: (t) => ({
      unreadOnly: t.boolean({ required: false }),
      limit: t.int({ required: false }),
      offset: t.int({ required: false }),
    }),
  },
);
