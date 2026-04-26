import { AmenityCategory } from "@kasistay/db";
import { Context } from "../../../app/context";
import { badInput, notFound, unauthorized } from "../../../utils/errors";

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

const assertAdmin = (ctx: Context): void => {
  if (!ctx.isAdmin) {
    unauthorized();
  }
};

export const createAmenity = async (
  input: {
    name: string;
    category: string;
  },
  ctx: Context,
) => {
  assertAdmin(ctx);

  const category = parseEnum(AmenityCategory, input.category, "amenity category");
  if (!category) {
    badInput("Amenity category is required");
  }

  return ctx.prisma.amenity.create({
    data: {
      name: input.name.trim(),
      category: category!,
    },
  });
};

export const updateAmenity = async (
  amenityId: string,
  input: {
    name?: string | null;
    category?: string | null;
  },
  ctx: Context,
) => {
  assertAdmin(ctx);

  const existingAmenity = await ctx.prisma.amenity.findUnique({
    where: { id: amenityId },
  });

  if (!existingAmenity) {
    notFound("Amenity not found");
  }

  return ctx.prisma.amenity.update({
    where: { id: amenityId },
    data: {
      ...(input.name != null && { name: input.name.trim() }),
      ...(input.category != null && {
        category: parseEnum(
          AmenityCategory,
          input.category,
          "amenity category",
        ),
      }),
    },
  });
};

export const deleteAmenity = async (amenityId: string, ctx: Context) => {
  assertAdmin(ctx);

  const existingAmenity = await ctx.prisma.amenity.findUnique({
    where: { id: amenityId },
  });

  if (!existingAmenity) {
    notFound("Amenity not found");
  }

  return ctx.prisma.amenity.delete({
    where: { id: amenityId },
  });
};
