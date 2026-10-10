// middleware/validation.js

function validateMortgageParams(req, res, next) {
  const { priceCents, priceUsd, annualRate, loanYears } = req.body;
  const price = priceCents || (priceUsd ? priceUsd * 100 : null);

  if (price !== null && (isNaN(price) || price <= 0)) {
    return res.status(400).json({ error: 'Property price must be a positive number' });
  }

  if (annualRate !== undefined && (isNaN(annualRate) || Number(annualRate) < 0 || Number(annualRate) > 40)) {
    return res.status(400).json({ error: 'Annual rate must be between 0% and 40%' });
  }

  if (loanYears !== undefined && (isNaN(loanYears) || Number(loanYears) < 1 || Number(loanYears) > 50)) {
    return res.status(400).json({ error: 'Loan term must be between 1 and 50 years' });
  }

  next();
}

module.exports = {
  validateMortgageParams
};
