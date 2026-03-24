import { Context } from "./context";

export const shields = {
  isAuthenticated: (ctx: Context): boolean => ctx.isAuthenticated,
  isAdmin: (ctx: Context): boolean => ctx.isAdmin,
  isCustomer: (ctx: Context): boolean => ctx.isCustomer,

  isSelf: (ctx: Context, userId: string): boolean => {
    if (!ctx.isAuthenticated) return false;
    return ctx.session?.user.id === userId;
  },

  isAdminOrSelf: (ctx: Context, userId: string): boolean => {
    return shields.isAdmin(ctx) || shields.isSelf(ctx, userId);
  },
};
