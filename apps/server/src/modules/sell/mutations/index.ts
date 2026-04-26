import { Context } from "../../../app/context";
import { upsertSellDetail } from "../../properties/mutations";

export const savePropertySellDetail = async (
  propertyId: string,
  input: Parameters<typeof upsertSellDetail>[1],
  ctx: Context,
) => upsertSellDetail(propertyId, input, ctx);
