import Mailgen from "mailgen";

let instance: Mailgen | null = null;

export const getMailgenInstance = (_theme: string = "default"): Mailgen => {
  if (!instance) {
    instance = new Mailgen({
      theme: "default",
      product: {
        name: "kasistay",
        link: process.env.FRONTEND_URL || "http://localhost:3000",
      },
    });
  }
  return instance;
};
