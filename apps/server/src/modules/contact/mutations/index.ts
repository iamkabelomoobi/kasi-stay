import { Context } from "../../../app/context";

export const submitContactMessage = async (
  input: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    subject: string;
    message: string;
  },
  ctx: Context,
) => {
  const user = ctx.assertAuth();

  return ctx.prisma.contactMessage.create({
    data: {
      userId: user.id,
      name: input.name?.trim() || user.name,
      email: input.email?.trim() || user.email,
      phone: input.phone ?? null,
      subject: input.subject,
      message: input.message,
    },
  });
};
