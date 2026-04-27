import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateAffordability,
  calculateBond,
} from "../src/modules/tools/mutations/index.ts";

test("bond calculator returns principal, repayment, and interest totals", () => {
  const result = calculateBond({
    propertyPrice: 1_200_000,
    deposit: 200_000,
    annualInterestRate: 0,
    termMonths: 240,
  });

  assert.equal(result.principal, 1_000_000);
  assert.ok(Math.abs(result.monthlyRepayment - 1_000_000 / 240) < 1e-9);
  assert.ok(Math.abs(result.totalRepayment - 1_000_000) < 1e-6);
  assert.ok(Math.abs(result.totalInterest) < 1e-6);
});

test("affordability calculator uses disposable income and term inputs", () => {
  const result = calculateAffordability({
    monthlyIncome: 50_000,
    monthlyExpenses: 10_000,
    monthlyDebtRepayments: 5_000,
    annualInterestRate: 0,
    termMonths: 240,
    deposit: 200_000,
    affordabilityRatio: 0.3,
  });

  assert.equal(result.disposableIncome, 35_000);
  assert.equal(result.maxAffordableRepayment, 10_500);
  assert.equal(result.maxLoanAmount, 2_520_000);
  assert.equal(result.estimatedPurchasePrice, 2_720_000);
});
