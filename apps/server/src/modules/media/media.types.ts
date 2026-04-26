import { builder } from "../../app/builder";

export const AddPropertyMediaItemInput = builder.inputType(
  "AddPropertyMediaItemInput",
  {
    fields: (t) => ({
      url: t.string({ required: true }),
      type: t.string({ required: false }),
      order: t.int({ required: false }),
      isPrimary: t.boolean({ required: false }),
    }),
  },
);

export const AddPropertyMediaInput = builder.inputType("AddPropertyMediaInput", {
  fields: (t) => ({
    media: t.field({
      type: [AddPropertyMediaItemInput],
      required: true,
    }),
  }),
});

export const CreatePropertyMediaUploadTargetInput = builder.inputType(
  "CreatePropertyMediaUploadTargetInput",
  {
    fields: (t) => ({
      filename: t.string({ required: true }),
      contentType: t.string({ required: true }),
      sizeBytes: t.int({ required: true }),
    }),
  },
);

export const PropertyMediaReorderItemInput = builder.inputType(
  "PropertyMediaReorderItemInput",
  {
    fields: (t) => ({
      mediaId: t.id({ required: true }),
      order: t.int({ required: true }),
    }),
  },
);

export const PropertyMediaReorderInput = builder.inputType(
  "PropertyMediaReorderInput",
  {
    fields: (t) => ({
      items: t.field({
        type: [PropertyMediaReorderItemInput],
        required: true,
      }),
    }),
  },
);
