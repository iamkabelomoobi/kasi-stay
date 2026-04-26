import { builder } from "../../app/builder";

export const SavedSearchInput = builder.inputType("SavedSearchInput", {
  fields: (t) => ({
    filtersJson: t.string({ required: true }),
    alertEnabled: t.boolean({ required: false }),
  }),
});
