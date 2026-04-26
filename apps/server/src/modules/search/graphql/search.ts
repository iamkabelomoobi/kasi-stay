import { builder } from "../../../app/builder";
import { PropertyRef } from "../../properties/graphql/property";
import { searchProperties } from "../queries";
import { PropertySearchInput } from "../search.types";

builder.queryField("propertySearch", (t) =>
  t.field({
    type: [PropertyRef],
    description: "Search properties with text, structured, and geo filters",
    args: {
      filter: t.arg({ type: PropertySearchInput, required: false }),
    },
    resolve: (_, args, ctx) => searchProperties(ctx, args.filter ?? undefined),
  }),
);
