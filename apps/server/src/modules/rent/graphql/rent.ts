import { builder } from "../../../app/builder";
import { RentDetailRef } from "../../properties/graphql/property";
import { savePropertyRentDetail } from "../mutations";
import { getPropertyRentDetail } from "../queries";
import { RentDetailInput } from "../rent.types";

builder.queryField("propertyRentDetail", (t) =>
  t.field({
    type: RentDetailRef,
    nullable: true,
    description: "Fetch the rent detail for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      getPropertyRentDetail(String(args.propertyId), ctx),
  }),
);

builder.mutationField("savePropertyRentDetail", (t) =>
  t.field({
    type: RentDetailRef,
    authScopes: { isAuthenticated: true },
    description: "Create or update the rent detail for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: RentDetailInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      savePropertyRentDetail(String(args.propertyId), args.input, ctx),
  }),
);
