import { builder } from "../../app/builder";

export const ScheduleViewingInput = builder.inputType("ScheduleViewingInput", {
  fields: (t) => ({
    scheduledAt: t.field({ type: "Date", required: true }),
  }),
});

export const ViewingFilterInput = builder.inputType("ViewingFilterInput", {
  fields: (t) => ({
    propertyId: t.id({ required: false }),
    inquiryId: t.id({ required: false }),
    status: t.string({ required: false }),
    limit: t.int({ required: false }),
    offset: t.int({ required: false }),
  }),
});
