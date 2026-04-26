import { AmenityCategory } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput } from "../../../utils/errors";

const parseEnum = <T extends Record<string, string>>(
  enumObject: T,
  value: string | null | undefined,
  field: string,
): T[keyof T] | undefined => {
  if (value == null) return undefined;
  const normalized = value.toUpperCase().trim();
  const parsed = enumObject[normalized as keyof T];

  if (!parsed) {
    badInput(`Invalid ${field}: ${value}`);
  }

  return parsed;
};

export const listAmenities = async (
  ctx: Context,
  filter?: {
    category?: string | null;
  },
) => {
  const category = parseEnum(
    AmenityCategory,
    filter?.category ?? undefined,
    "amenity category",
  );

  return ctx.prisma.amenity.findMany({
    where: {
      ...(category && { category }),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
};
