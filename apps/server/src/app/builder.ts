import { Kind } from "graphql";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import ErrorsPlugin from "@pothos/plugin-errors";
import ValidationPlugin from "@pothos/plugin-validation";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import { prisma } from "@kasistay/db";
import { getDatamodel } from "@kasistay/db/generated/pothos-types";
import type PrismaTypes from "@kasistay/db/generated/pothos-types";
import type { Context } from "./context";

export const builder = new SchemaBuilder<{
  Context: Context;
  AuthScopes: {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isCustomer: boolean;
  };
  PrismaTypes: PrismaTypes;
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [
    ScopeAuthPlugin,
    PrismaPlugin,
    ErrorsPlugin,
    ValidationPlugin,
    SimpleObjectsPlugin,
  ],
  scopeAuth: {
    authScopes: (ctx) => ({
      isAuthenticated: ctx.isAuthenticated,
      isAdmin: ctx.isAdmin,
      isCustomer: ctx.isCustomer,
    }),
  },
  prisma: {
    client: prisma,
    dmmf: getDatamodel(),
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
  },
});

builder.scalarType("Date", {
  serialize: (value) =>
    value instanceof Date ? value.getTime() : (value as any),
  parseValue: (value) => {
    if (typeof value === "string" || typeof value === "number") {
      return new Date(value);
    }
    throw new Error("Invalid Date value");
  },
  parseLiteral: (ast) => {
    if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error("Invalid Date literal");
  },
});

builder.queryType({});
builder.mutationType({});
