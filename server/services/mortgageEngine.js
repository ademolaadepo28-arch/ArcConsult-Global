// services/mortgageEngine.js
/**
 * Calculates monthly mortgage payment and amortization schedule.
 * Exact formula implementation from Architecture Spec #05
 * @param {number} principalCents - Loan principal in cents
 * @param {number} annualRate - Annual interest rate (e.g., 6.5 for 6.5%)
 * @param {number} years - Loan term in years (e.g., 30)
 * @param {number} [extraMonthlyPrincipalCents=0] - Optional additional principal payment
 */
function calculateAmortization(principalCents, annualRate, years, extraMonthlyPrincipalCents = 0) {
  if (principalCents <= 0) {
    return { monthlyPaymentCents: 0, totalPayments: 0, schedule: [] };
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = years * 12;

  // Monthly Payment Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
  let monthlyPaymentCents = 0;
  if (monthlyRate === 0) {
    monthlyPaymentCents = Math.round(principalCents / totalPayments);
  } else {
    monthlyPaymentCents = Math.round(
      (principalCents * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1)
    );
  }

  let remainingBalanceCents = principalCents;
  const schedule = [];
  let totalInterestPaidCents = 0;
  let totalPrincipalPaidCents = 0;

  for (let month = 1; month <= totalPayments; month++) {
    if (remainingBalanceCents <= 0) break;

    const interestPaymentCents = Math.round(remainingBalanceCents * monthlyRate);
    let principalPaymentCents = monthlyPaymentCents - interestPaymentCents;

    // Apply extra monthly principal if requested
    if (extraMonthlyPrincipalCents > 0) {
      principalPaymentCents += extraMonthlyPrincipalCents;
    }

    // In the final payment month or when remaining balance is less than principal payment, reconcile pennies
    if (month === totalPayments || principalPaymentCents >= remainingBalanceCents) {
      principalPaymentCents = remainingBalanceCents;
    }

    remainingBalanceCents -= principalPaymentCents;
    totalInterestPaidCents += interestPaymentCents;
    totalPrincipalPaidCents += principalPaymentCents;

    schedule.push({
      month,
      paymentCents: principalPaymentCents + interestPaymentCents,
      principalCents: principalPaymentCents,
      interestCents: interestPaymentCents,
      remainingBalanceCents: Math.max(0, remainingBalanceCents),
      cumulativeInterestCents: totalInterestPaidCents,
      cumulativePrincipalCents: totalPrincipalPaidCents
    });
  }

  return {
    monthlyPaymentCents,
    totalPayments: schedule.length,
    originalTermMonths: totalPayments,
    totalInterestPaidCents,
    totalPrincipalPaidCents,
    totalCostCents: totalPrincipalPaidCents + totalInterestPaidCents,
    schedule
  };
}

/**
 * Calculates complete monthly homebuyer payment (PITI + HOA + PMI)
 */
function calculateComprehensivePayment({
  priceCents,
  downPaymentPercent = 20,
  annualRate = 6.5,
  loanYears = 30,
  annualPropertyTaxCents = 0,
  estimatedHoaMonthlyCents = 0,
  extraMonthlyPrincipalCents = 0,
  annualPmiRate = 0.75 // standard 0.75% PMI if down payment < 20%
}) {
  const downPaymentCents = Math.round(priceCents * (downPaymentPercent / 100));
  const principalCents = priceCents - downPaymentCents;

  const amortization = calculateAmortization(
    principalCents,
    annualRate,
    loanYears,
    extraMonthlyPrincipalCents
  );

  const monthlyPropertyTaxCents = Math.round(annualPropertyTaxCents / 12);
  const isPmiApplicable = downPaymentPercent < 20;
  const monthlyPmiCents = isPmiApplicable
    ? Math.round((principalCents * (annualPmiRate / 100)) / 12)
    : 0;

  const totalMonthlyPaymentCents =
    amortization.monthlyPaymentCents +
    monthlyPropertyTaxCents +
    estimatedHoaMonthlyCents +
    monthlyPmiCents +
    extraMonthlyPrincipalCents;

  return {
    priceCents,
    downPaymentCents,
    downPaymentPercent,
    principalCents,
    annualRate,
    loanYears,
    monthlyPrincipalInterestCents: amortization.monthlyPaymentCents,
    monthlyPropertyTaxCents,
    monthlyHoaCents: estimatedHoaMonthlyCents,
    monthlyPmiCents,
    extraMonthlyPrincipalCents,
    totalMonthlyPaymentCents,
    totalInterestPaidCents: amortization.totalInterestPaidCents,
    totalCostCents: amortization.totalCostCents,
    schedule: amortization.schedule
  };
}

/**
 * Calculates real estate investor metrics:
 * - Gross Rental Yield
 * - Net Operating Income (NOI)
 * - Net Cap Rate
 * - Cash-on-Cash Return
 * - 10-Year Projections
 */
function calculateInvestmentMetrics({
  purchasePriceCents,
  estimatedMonthlyRentCents,
  annualPropertyTaxCents = 0,
  monthlyHoaCents = 0,
  downPaymentPercent = 20,
  annualRate = 6.5,
  loanYears = 30,
  vacancyRatePercent = 5,
  annualInsuranceCents = 140000, // default $1,400/yr
  maintenanceRatePercent = 1, // 1% of purchase price annually
  annualAppreciationPercent = 3.5
}) {
  const annualGrossRentCents = estimatedMonthlyRentCents * 12;
  const grossRentalYieldPercent = Number(
    ((annualGrossRentCents / purchasePriceCents) * 100).toFixed(2)
  );

  const vacancyLossCents = Math.round(annualGrossRentCents * (vacancyRatePercent / 100));
  const effectiveGrossIncomeCents = annualGrossRentCents - vacancyLossCents;

  const annualHoaCents = monthlyHoaCents * 12;
  const annualMaintenanceCents = Math.round(purchasePriceCents * (maintenanceRatePercent / 100));
  const totalOperatingExpensesCents =
    annualPropertyTaxCents + annualHoaCents + annualInsuranceCents + annualMaintenanceCents;

  const netOperatingIncomeCents = effectiveGrossIncomeCents - totalOperatingExpensesCents;
  const capRatePercent = Number(
    ((netOperatingIncomeCents / purchasePriceCents) * 100).toFixed(2)
  );

  // Mortgage debt service
  const downPaymentCents = Math.round(purchasePriceCents * (downPaymentPercent / 100));
  const principalCents = purchasePriceCents - downPaymentCents;
  const amort = calculateAmortization(principalCents, annualRate, loanYears);
  const annualDebtServiceCents = amort.monthlyPaymentCents * 12;

  const netAnnualCashFlowCents = netOperatingIncomeCents - annualDebtServiceCents;
  const monthlyCashFlowCents = Math.round(netAnnualCashFlowCents / 12);

  // Estimated initial cash invested: Down payment + 3% closing costs
  const closingCostsCents = Math.round(purchasePriceCents * 0.03);
  const initialCashInvestedCents = downPaymentCents + closingCostsCents;

  const cashOnCashReturnPercent = Number(
    ((netAnnualCashFlowCents / initialCashInvestedCents) * 100).toFixed(2)
  );

  // 10-Year Growth & Equity Accumulation
  const tenYearProjection = [];
  let projectedPropertyValueCents = purchasePriceCents;
  let cumulativeCashFlowCents = 0;

  for (let year = 1; year <= 10; year++) {
    projectedPropertyValueCents = Math.round(
      projectedPropertyValueCents * (1 + annualAppreciationPercent / 100)
    );
    const monthIndex = Math.min(year * 12 - 1, amort.schedule.length - 1);
    const remainingMortgageCents = monthIndex >= 0 ? amort.schedule[monthIndex].remainingBalanceCents : 0;
    const accumulatedEquityCents = projectedPropertyValueCents - remainingMortgageCents;
    cumulativeCashFlowCents += netAnnualCashFlowCents;

    tenYearProjection.push({
      year,
      propertyValueCents: projectedPropertyValueCents,
      remainingMortgageCents,
      accumulatedEquityCents,
      cumulativeCashFlowCents,
      totalReturnCents: (accumulatedEquityCents - downPaymentCents) + cumulativeCashFlowCents
    });
  }

  return {
    purchasePriceCents,
    estimatedMonthlyRentCents,
    annualGrossRentCents,
    grossRentalYieldPercent,
    netOperatingIncomeCents,
    capRatePercent,
    annualDebtServiceCents,
    netAnnualCashFlowCents,
    monthlyCashFlowCents,
    initialCashInvestedCents,
    cashOnCashReturnPercent,
    tenYearProjection
  };
}

module.exports = {
  calculateAmortization,
  calculateComprehensivePayment,
  calculateInvestmentMetrics
};
