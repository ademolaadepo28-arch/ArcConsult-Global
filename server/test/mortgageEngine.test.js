// test/mortgageEngine.test.js
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateAmortization,
  calculateComprehensivePayment,
  calculateInvestmentMetrics
} = require('../services/mortgageEngine');

describe('Mortgage Amortization Formula', () => {
  test('accurately calculates monthly payment for $400,000 loan at 6.5% for 30 years', () => {
    // 400,000 USD = 40,000,000 cents
    const principalCents = 40000000;
    const rate = 6.5;
    const years = 30;

    const result = calculateAmortization(principalCents, rate, years);

    // Standard formula: M = 400000 * (0.065/12 * (1 + 0.065/12)^360) / ((1 + 0.065/12)^360 - 1)
    // ≈ 2,528.27 USD = 252827 cents
    assert.equal(result.monthlyPaymentCents, 252827);
    assert.equal(result.totalPayments, 360);
    assert.equal(result.schedule.length, 360);

    // Initial month check
    const firstMonth = result.schedule[0];
    assert.equal(firstMonth.month, 1);
    assert.equal(firstMonth.interestCents, Math.round(40000000 * (6.5 / 100 / 12))); // 216667 cents
    assert.equal(firstMonth.principalCents, 252827 - 216667); // 36160 cents

    // Final balance should reach zero
    const lastMonth = result.schedule[result.schedule.length - 1];
    assert.equal(lastMonth.remainingBalanceCents, 0);
  });

  test('comprehensive payment includes taxes, HOA, and PMI when down payment < 20%', () => {
    const payment = calculateComprehensivePayment({
      priceCents: 50000000, // $500,000
      downPaymentPercent: 10, // 10% down ($50,000) -> Principal $450,000
      annualRate: 6.5,
      loanYears: 30,
      annualPropertyTaxCents: 600000, // $6,000/yr -> $500/mo
      estimatedHoaMonthlyCents: 25000, // $250/mo
      annualPmiRate: 0.75
    });

    assert.equal(payment.downPaymentCents, 5000000);
    assert.equal(payment.principalCents, 45000000);
    assert.equal(payment.monthlyPropertyTaxCents, 50000);
    assert.equal(payment.monthlyHoaCents, 25000);
    assert.ok(payment.monthlyPmiCents > 0, 'PMI must be calculated when down payment < 20%');
    assert.equal(
      payment.totalMonthlyPaymentCents,
      payment.monthlyPrincipalInterestCents +
        payment.monthlyPropertyTaxCents +
        payment.monthlyHoaCents +
        payment.monthlyPmiCents
    );
  });

  test('investment yield calculation correctly computes Cap Rate and Gross Yield', () => {
    const yields = calculateInvestmentMetrics({
      purchasePriceCents: 30000000, // $300,000
      estimatedMonthlyRentCents: 220000, // $2,200/mo -> $26,400/yr
      annualPropertyTaxCents: 360000,
      monthlyHoaCents: 15000,
      downPaymentPercent: 25,
      annualRate: 6.5,
      loanYears: 30
    });

    assert.equal(yields.annualGrossRentCents, 2640000);
    assert.equal(yields.grossRentalYieldPercent, 8.8);
    assert.ok(yields.capRatePercent > 0);
    assert.equal(yields.tenYearProjection.length, 10);
  });
});
