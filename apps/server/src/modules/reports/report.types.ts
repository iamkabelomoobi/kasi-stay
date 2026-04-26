import { builder } from "../../app/builder";

export const ReportInput = builder.inputType("ReportInput", {
  fields: (t) => ({
    reason: t.string({ required: true }),
    description: t.string({ required: false }),
  }),
});

export const ReportFilterInput = builder.inputType("ReportFilterInput", {
  fields: (t) => ({
    status: t.string({ required: false }),
  }),
});
