import { Context } from "../../../app/context";
import { upsertBuyDetail, upsertPaymentPlan } from "../../properties/mutations";

export const savePropertyBuyDetail = async (
  propertyId: string,
  input: Parameters<typeof upsertBuyDetail>[1],
  ctx: Context,
) => upsertBuyDetail(propertyId, input, ctx);

export const savePropertyBuyPaymentPlan = async (
  propertyId: string,
  input: Parameters<typeof upsertPaymentPlan>[1],
  ctx: Context,
) => upsertPaymentPlan(propertyId, input, ctx);
