// middleware/validation.js

function validateMortgageParams(req, res, next) {
  const { priceCents, priceUsd, annualRate, loanYears } = req.body;
  const price = priceCents || (priceUsd ? priceUsd * 100 : null);

  if (price !== null && (isNaN(price) || price <= 0)) {
    return res.status(400).json({ error: 'Property price must be a positive number' });
  }

  if (annualRate !== undefined && (isNaN(annualRate) || annualRate < 0 || annualRate > 30)) {
    return res.status(400).json({ error: 'Annual rate must be between 0% and 30%' });
  }

  if (loanYears !== undefined && (![10, 15, 20, 25, 30, 40].includes(Number(loanYears)))) {
    return res.status(400).json({ error: 'Loan term must be a standard period (e.g. 15, 20, 30 years)' });
  }

  next();
}

module.exports = {
  validateMortgageParams
};
