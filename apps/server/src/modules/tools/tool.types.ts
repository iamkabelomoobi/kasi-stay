import { builder } from "../../app/builder";

export const AttorneyFilterInput = builder.inputType("AttorneyFilterInput", {
  fields: (t) => ({
    q: t.string({ required: false }),
    city: t.string({ required: false }),
    status: t.string({ required: false }),
    limit: t.int({ required: false }),
    offset: t.int({ required: false }),
  }),
});

export const AttorneyProfileInput = builder.inputType("AttorneyProfileInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    slug: t.string({ required: false }),
    firmName: t.string({ required: false }),
    description: t.string({ required: false }),
    city: t.string({ required: true }),
    email: t.string({ required: false }),
    phone: t.string({ required: false }),
    websiteUrl: t.string({ required: false }),
    imageUrl: t.string({ required: false }),
    status: t.string({ required: false }),
  }),
});

export const AttorneyProfileUpdateInput = builder.inputType(
  "AttorneyProfileUpdateInput",
  {
    fields: (t) => ({
      name: t.string({ required: false }),
      slug: t.string({ required: false }),
      firmName: t.string({ required: false }),
      description: t.string({ required: false }),
      city: t.string({ required: false }),
      email: t.string({ required: false }),
      phone: t.string({ required: false }),
      websiteUrl: t.string({ required: false }),
      imageUrl: t.string({ required: false }),
      status: t.string({ required: false }),
    }),
  },
);

export const BondCalculatorInput = builder.inputType("BondCalculatorInput", {
  fields: (t) => ({
    propertyPrice: t.float({ required: true }),
    deposit: t.float({ required: false }),
    annualInterestRate: t.float({ required: true }),
    termMonths: t.int({ required: false }),
  }),
});

export const AffordabilityCalculatorInput = builder.inputType(
  "AffordabilityCalculatorInput",
  {
    fields: (t) => ({
      monthlyIncome: t.float({ required: true }),
      monthlyExpenses: t.float({ required: false }),
      monthlyDebtRepayments: t.float({ required: false }),
      annualInterestRate: t.float({ required: true }),
      termMonths: t.int({ required: false }),
      deposit: t.float({ required: false }),
      affordabilityRatio: t.float({ required: false }),
    }),
  },
);
