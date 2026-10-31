import assert from "node:assert/strict";
import test from "node:test";
import { calculateLoan, formatDuration } from "../assets/js/loan-calculator.js";

const defaultLoan = {
  principal: 30_000_000,
  annualInterestRate: 0.035,
  initialRepaymentRate: 0.02,
  annualExtraRepaymentRate: 0,
  pauseExtraRepayment: false,
  pauseFromYear: 2026,
  pauseToYear: 2026,
  refinancingEnabled: false,
  fixedRateMonths: 120,
  followUpInterestRate: 0.045,
  followUpRepaymentRate: 0.02,
  followUpExtraRepaymentRate: 0,
  pauseFollowUpExtraRepayment: false,
  followUpPauseFromYear: 2026,
  followUpPauseToYear: 2026,
  startDate: new Date(2026, 0, 1),
};

test("amortizes a standard loan and reconciles the schedule totals", () => {
  const result = calculateLoan(defaultLoan);
  const principalRepaid = result.months.reduce(
    (total, month) => total + month.principalPaid + month.extraRepayment,
    0,
  );
  const scheduledInterest = result.months.reduce((total, month) => total + month.interest, 0);

  assert.equal(result.initialScheduledPayment, 137_500);
  assert.equal(result.months.at(-1).balance, 0);
  assert.equal(principalRepaid, defaultLoan.principal);
  assert.equal(result.totalInterest, scheduledInterest);
});

test("handles a zero-interest loan", () => {
  const result = calculateLoan({
    ...defaultLoan,
    principal: 120_000,
    annualInterestRate: 0,
    initialRepaymentRate: 1,
  });

  assert.equal(result.totalInterest, 0);
  assert.equal(result.months.length, 12);
  assert.equal(result.months.at(-1).balance, 0);
});

test("rejects a scheduled payment that does not cover monthly interest", () => {
  assert.throws(() => calculateLoan({
    ...defaultLoan,
    principal: 1,
    annualInterestRate: 0.12,
    initialRepaymentRate: 0.005,
  }));
});

test("annual extra repayments reduce payoff time and interest", () => {
  const withoutExtraRepayment = calculateLoan(defaultLoan);
  const withExtraRepayment = calculateLoan({
    ...defaultLoan,
    annualExtraRepaymentRate: 0.05,
  });

  assert.ok(withExtraRepayment.months.length < withoutExtraRepayment.months.length);
  assert.ok(withExtraRepayment.totalInterest < withoutExtraRepayment.totalInterest);
});

test("applies the follow-up rate after the fixed-rate period", () => {
  const result = calculateLoan({
    ...defaultLoan,
    refinancingEnabled: true,
    fixedRateMonths: 120,
    followUpInterestRate: 0.05,
  });

  assert.equal(result.refinancingBalance, result.months[119].balance);
  assert.notEqual(result.months[120].payment, result.initialScheduledPayment);
});

test("formats durations as localized German labels", () => {
  assert.equal(formatDuration(1), "1 Monat");
  assert.equal(formatDuration(12), "1 Jahr");
  assert.equal(formatDuration(14), "1 J. 2 Mon.");
});
