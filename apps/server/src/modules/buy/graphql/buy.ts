import { builder } from "../../../app/builder";
import { BuyDetailRef, PaymentPlanRef } from "../../properties/graphql/property";
import {
  savePropertyBuyDetail,
  savePropertyBuyPaymentPlan,
} from "../mutations";
import { getPropertyBuyDetail } from "../queries";
import { BuyDetailInput, PaymentPlanInput } from "../buy.types";

builder.queryField("propertyBuyDetail", (t) =>
  t.field({
    type: BuyDetailRef,
    nullable: true,
    description: "Fetch the buy detail for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) => getPropertyBuyDetail(String(args.propertyId), ctx),
  }),
);

builder.mutationField("savePropertyBuyDetail", (t) =>
  t.field({
    type: BuyDetailRef,
    authScopes: { isAuthenticated: true },
    description: "Create or update the buy detail for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: BuyDetailInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      savePropertyBuyDetail(String(args.propertyId), args.input, ctx),
  }),
);

builder.mutationField("savePropertyBuyPaymentPlan", (t) =>
  t.field({
    type: PaymentPlanRef,
    authScopes: { isAuthenticated: true },
    description: "Create or replace the buy payment plan for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: PaymentPlanInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      savePropertyBuyPaymentPlan(String(args.propertyId), args.input, ctx),
  }),
);
