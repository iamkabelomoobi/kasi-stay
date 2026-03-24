import { GraphQLError } from "graphql";

export const unauthenticated = (): never => {
  throw new GraphQLError("Unauthenticated", {
    extensions: { code: "UNAUTHENTICATED" },
  });
};

export const unauthorized = (): never => {
  throw new GraphQLError("Unauthorized", {
    extensions: { code: "UNAUTHORIZED" },
  });
};

export const notFound = (message = "Not found"): never => {
  throw new GraphQLError(message, { extensions: { code: "NOT_FOUND" } });
};

export const badInput = (message: string): never => {
  throw new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
};
