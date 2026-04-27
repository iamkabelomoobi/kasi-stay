import { slugify } from "./slugify";

export const generateUniqueSlug = async (
  value: string,
  exists: (slug: string) => Promise<boolean>,
) => {
  const base = slugify(value);
  let candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`;

  while (await exists(candidate)) {
    candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }

  return candidate;
};
