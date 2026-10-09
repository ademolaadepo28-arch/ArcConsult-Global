// routes/mortgage.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const portfolioController = require('../controllers/portfolioController');
const { validateMortgageParams } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// POST /api/mortgage/amortization - Calculate principal/interest schedule & sensitivity
router.post('/amortization', validateMortgageParams, analyticsController.calculateAmortization);

// POST /api/mortgage/investment - Calculate Gross Yield, Cap Rate, Cash-on-Cash & 10yr equity
router.post('/investment', analyticsController.calculateInvestmentYields);

// POST /api/mortgage/compare - Compare multiple properties side-by-side
router.post('/compare', analyticsController.compareProperties);

// Saved Portfolios endpoints (JWT protected with demo user fallback)
router.get('/portfolio', authenticate, portfolioController.getSavedPortfolios);
router.post('/portfolio/toggle', authenticate, portfolioController.toggleSaveProperty);

module.exports = router;
