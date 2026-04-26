import { Context } from "../../../app/context";
import { upsertRentDetail } from "../../properties/mutations";

export const savePropertyRentDetail = async (
  propertyId: string,
  input: Parameters<typeof upsertRentDetail>[1],
  ctx: Context,
) => upsertRentDetail(propertyId, input, ctx);
