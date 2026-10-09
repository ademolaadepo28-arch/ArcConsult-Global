// controllers/analyticsController.js
const mortgageEngine = require('../services/mortgageEngine');
const db = require('../config/database');

/**
 * Controller for Mortgage Calculations and Sensitivity Analysis
 */
function calculateAmortization(req, res) {
  try {
    const {
      priceCents,
      priceUsd,
      downPaymentPercent = 20,
      annualRate = 6.5,
      loanYears = 30,
      annualPropertyTaxCents,
      annualPropertyTaxUsd,
      estimatedHoaMonthlyCents,
      estimatedHoaMonthlyUsd,
      extraMonthlyPrincipalCents = 0
    } = req.body;

    const finalPriceCents = priceCents || Math.round(Number(priceUsd || 500000) * 100);
    const finalTaxCents = annualPropertyTaxCents !== undefined
      ? annualPropertyTaxCents
      : (annualPropertyTaxUsd !== undefined ? Math.round(annualPropertyTaxUsd * 100) : Math.round(finalPriceCents * 0.016));
    const finalHoaCents = estimatedHoaMonthlyCents !== undefined
      ? estimatedHoaMonthlyCents
      : (estimatedHoaMonthlyUsd !== undefined ? Math.round(estimatedHoaMonthlyUsd * 100) : 0);

    const payment = mortgageEngine.calculateComprehensivePayment({
      priceCents: finalPriceCents,
      downPaymentPercent: Number(downPaymentPercent),
      annualRate: Number(annualRate),
      loanYears: Number(loanYears),
      annualPropertyTaxCents: finalTaxCents,
      estimatedHoaMonthlyCents: finalHoaCents,
      extraMonthlyPrincipalCents: Number(extraMonthlyPrincipalCents)
    });

    // Sensitivity Matrix: test rates from (rate - 1.5%) to (rate + 1.5%) in steps of 0.5%
    const sensitivity = [];
    const baseRate = Number(annualRate);
    const deltaSteps = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5];

    for (const delta of deltaSteps) {
      const testRate = Math.max(0.1, Number((baseRate + delta).toFixed(2)));
      const testAmort = mortgageEngine.calculateAmortization(payment.principalCents, testRate, Number(loanYears));
      sensitivity.push({
        rate: testRate,
        isCurrent: delta === 0,
        monthlyPrincipalInterestCents: testAmort.monthlyPaymentCents,
        totalInterestPaidCents: testAmort.totalInterestPaidCents,
        monthlyPaymentUsd: testAmort.monthlyPaymentCents / 100,
        totalCostUsd: testAmort.totalCostCents / 100
      });
    }

    return res.json({
      summary: {
        priceUsd: payment.priceCents / 100,
        downPaymentUsd: payment.downPaymentCents / 100,
        downPaymentPercent: payment.downPaymentPercent,
        principalUsd: payment.principalCents / 100,
        annualRate: payment.annualRate,
        loanYears: payment.loanYears,
        monthlyPrincipalInterestUsd: payment.monthlyPrincipalInterestCents / 100,
        monthlyPropertyTaxUsd: payment.monthlyPropertyTaxCents / 100,
        monthlyHoaUsd: payment.monthlyHoaCents / 100,
        monthlyPmiUsd: payment.monthlyPmiCents / 100,
        extraMonthlyPrincipalUsd: payment.extraMonthlyPrincipalCents / 100,
        totalMonthlyPaymentUsd: payment.totalMonthlyPaymentCents / 100,
        totalInterestPaidUsd: payment.totalInterestPaidCents / 100,
        totalCostUsd: payment.totalCostCents / 100
      },
      rawCents: payment,
      sensitivity,
      schedule: payment.schedule.map((s) => ({
        month: s.month,
        paymentUsd: s.paymentCents / 100,
        principalUsd: s.principalCents / 100,
        interestUsd: s.interestCents / 100,
        remainingBalanceUsd: s.remainingBalanceCents / 100,
        cumulativeInterestUsd: s.cumulativeInterestCents / 100,
        cumulativePrincipalUsd: s.cumulativePrincipalCents / 100
      }))
    });
  } catch (error) {
    console.error('Amortization calculation error:', error);
    return res.status(500).json({ error: 'Failed to calculate amortization schedule' });
  }
}

/**
 * Controller for Real Estate Investor Yield & Cap Rate Analytics
 */
function calculateInvestmentYields(req, res) {
  try {
    const {
      purchasePriceCents,
      purchasePriceUsd,
      estimatedMonthlyRentCents,
      estimatedMonthlyRentUsd,
      annualPropertyTaxCents,
      monthlyHoaCents,
      downPaymentPercent = 20,
      annualRate = 6.5,
      loanYears = 30,
      vacancyRatePercent = 5,
      annualInsuranceCents = 140000,
      maintenanceRatePercent = 1,
      annualAppreciationPercent = 3.5
    } = req.body;

    const finalPriceCents = purchasePriceCents || Math.round(Number(purchasePriceUsd || 600000) * 100);
    const finalRentCents = estimatedMonthlyRentCents || Math.round(Number(estimatedMonthlyRentUsd || 3800) * 100);

    const yields = mortgageEngine.calculateInvestmentMetrics({
      purchasePriceCents: finalPriceCents,
      estimatedMonthlyRentCents: finalRentCents,
      annualPropertyTaxCents: annualPropertyTaxCents || Math.round(finalPriceCents * 0.016),
      monthlyHoaCents: monthlyHoaCents || 0,
      downPaymentPercent: Number(downPaymentPercent),
      annualRate: Number(annualRate),
      loanYears: Number(loanYears),
      vacancyRatePercent: Number(vacancyRatePercent),
      annualInsuranceCents: Number(annualInsuranceCents),
      maintenanceRatePercent: Number(maintenanceRatePercent),
      annualAppreciationPercent: Number(annualAppreciationPercent)
    });

    return res.json({
      metrics: {
        grossRentalYieldPercent: yields.grossRentalYieldPercent,
        capRatePercent: yields.capRatePercent,
        cashOnCashReturnPercent: yields.cashOnCashReturnPercent,
        monthlyCashFlowUsd: yields.monthlyCashFlowCents / 100,
        netAnnualCashFlowUsd: yields.netAnnualCashFlowCents / 100,
        netOperatingIncomeUsd: yields.netOperatingIncomeCents / 100,
        initialCashInvestedUsd: yields.initialCashInvestedCents / 100,
        annualGrossRentUsd: yields.annualGrossRentCents / 100,
        annualDebtServiceUsd: yields.annualDebtServiceCents / 100
      },
      tenYearProjection: yields.tenYearProjection.map((y) => ({
        year: y.year,
        propertyValueUsd: y.propertyValueCents / 100,
        remainingMortgageUsd: y.remainingMortgageCents / 100,
        accumulatedEquityUsd: y.accumulatedEquityCents / 100,
        cumulativeCashFlowUsd: y.cumulativeCashFlowCents / 100,
        totalReturnUsd: y.totalReturnCents / 100
      }))
    });
  } catch (error) {
    console.error('Investment yields calculation error:', error);
    return res.status(500).json({ error: 'Failed to calculate investment yield metrics' });
  }
}

/**
 * Compare multiple properties side-by-side
 */
async function compareProperties(req, res) {
  try {
    const { propertyIds } = req.body;
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({ error: 'propertyIds must be a non-empty array' });
    }

    const properties = db.fallbackProperties.filter((p) => propertyIds.includes(p.id));
    const comparisons = properties.map((p) => {
      const amort = mortgageEngine.calculateComprehensivePayment({
        priceCents: p.price_cents,
        downPaymentPercent: 20,
        annualRate: 6.5,
        loanYears: 30,
        annualPropertyTaxCents: p.annual_property_tax_cents,
        estimatedHoaMonthlyCents: p.estimated_hoa_monthly_cents
      });

      const rentCents = p.estimated_monthly_rent_cents || Math.round(p.price_cents * 0.006);
      const yields = mortgageEngine.calculateInvestmentMetrics({
        purchasePriceCents: p.price_cents,
        estimatedMonthlyRentCents: rentCents,
        annualPropertyTaxCents: p.annual_property_tax_cents,
        monthlyHoaCents: p.estimated_hoa_monthly_cents
      });

      return {
        id: p.id,
        title: p.title,
        property_type: p.property_type,
        street_address: p.street_address,
        priceUsd: p.price_cents / 100,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        square_feet: p.square_feet,
        pricePerSqFtUsd: Math.round(p.price_cents / 100 / p.square_feet),
        monthlyPaymentUsd: amort.totalMonthlyPaymentCents / 100,
        monthlyPrincipalInterestUsd: amort.monthlyPrincipalInterestCents / 100,
        monthlyPropertyTaxUsd: amort.monthlyPropertyTaxCents / 100,
        monthlyHoaUsd: amort.monthlyHoaCents / 100,
        grossYieldPercent: yields.grossRentalYieldPercent,
        capRatePercent: yields.capRatePercent,
        cashOnCashReturnPercent: yields.cashOnCashReturnPercent,
        monthlyCashFlowUsd: yields.monthlyCashFlowCents / 100
      };
    });

    return res.json({ comparisons });
  } catch (error) {
    console.error('Property comparison error:', error);
    return res.status(500).json({ error: 'Failed to compare properties' });
  }
}

module.exports = {
  calculateAmortization,
  calculateInvestmentYields,
  compareProperties
};
