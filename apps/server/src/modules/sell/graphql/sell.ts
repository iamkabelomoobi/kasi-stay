import { builder } from "../../../app/builder";
import {
  PriceHistoryRef,
  SellDetailRef,
} from "../../properties/graphql/property";
import { savePropertySellDetail } from "../mutations";
import {
  getPropertySellDetail,
  getPropertySellPriceHistory,
} from "../queries";
import { SellDetailInput } from "../sell.types";

builder.queryField("propertySellDetail", (t) =>
  t.field({
    type: SellDetailRef,
    nullable: true,
    description: "Fetch the sell detail for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      getPropertySellDetail(String(args.propertyId), ctx),
  }),
);

builder.queryField("propertySellPriceHistory", (t) =>
  t.field({
    type: [PriceHistoryRef],
    description: "Fetch sell price history for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
    },
    resolve: (_, args, ctx) =>
      getPropertySellPriceHistory(String(args.propertyId), ctx),
  }),
);

builder.mutationField("savePropertySellDetail", (t) =>
  t.field({
    type: SellDetailRef,
    authScopes: { isAuthenticated: true },
    description: "Create or update the sell detail for a property",
    args: {
      propertyId: t.arg.id({ required: true }),
      input: t.arg({ type: SellDetailInput, required: true }),
    },
    resolve: (_, args, ctx) =>
      savePropertySellDetail(String(args.propertyId), args.input, ctx),
  }),
);
