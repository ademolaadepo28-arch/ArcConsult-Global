// index.js - Server entrypoint
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase, getDatabaseStatus } = require('./config/database');
const propertiesRouter = require('./routes/properties');
const mortgageRouter = require('./routes/mortgage');
const { generateDemoToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Global Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/properties', propertiesRouter);
app.use('/api/mortgage', mortgageRouter);

// Health & System Info
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '1.0.0-spec05'
  });
});

// Demo token endpoint for testing JWT auth
app.get('/api/auth/demo-token', (req, res) => {
  const token = generateDemoToken();
  res.json({ token, user: { email: 'investor@arcconsult.com', fullName: 'Alexander Wright' } });
});

// Root welcome
app.get('/', (req, res) => {
  res.json({
    service: 'ArcConsult Real Estate & Mortgages Analytics API',
    spec: 'Portfolio Project Architecture Spec #05',
    endpoints: [
      'GET /api/properties?bbox=minLng,minLat,maxLng,maxLat',
      'GET /api/properties?lat=...&lng=...&radius=5000',
      'GET /api/properties/:id',
      'GET /api/properties/schools',
      'POST /api/mortgage/amortization',
      'POST /api/mortgage/investment',
      'POST /api/mortgage/compare',
      'GET /api/mortgage/portfolio',
      'POST /api/mortgage/portfolio/toggle'
    ]
  });
});

// Initialize DB and start listening
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Real Estate Analytics API running at http://localhost:${PORT}`);
  });
});

module.exports = app;
