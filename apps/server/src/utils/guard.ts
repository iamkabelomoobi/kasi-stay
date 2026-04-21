import { Context } from "../app/context";

type GuardFn = (ctx: Context, ...args: any[]) => boolean;

export const guard =
  (fn: GuardFn, message = "Forbidden") =>
    (ctx: Context, ...args: any[]): void => {
      if (!fn(ctx, ...args)) {
        throw new Error(message);
      }
    };

export const Guards = {
  authenticated: guard(
    (ctx) => ctx.isAuthenticated,
    "Unauthorized: you must be logged in",
  ),
  admin: guard((ctx) => ctx.isAdmin, "Forbidden: admin access required"),
  renter: guard(
    (ctx) => ctx.isRenter,
    "Forbidden: renter access required",
  ),
  self: guard(
    (ctx, userId: string) => ctx.session?.user.id === userId,
    "Forbidden: you can only access your own data",
  ),
  adminOrSelf: guard(
    (ctx, userId: string) => ctx.isAdmin || ctx.session?.user.id === userId,
    "Forbidden: admin or owner access required",
  ),
};
