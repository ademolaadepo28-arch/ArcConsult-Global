// routes/properties.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// GET /api/properties (supports ?bbox=minLng,minLat,maxLng,maxLat or ?lat=&lng=&radius=)
router.get('/', propertyController.getProperties);

// GET /api/properties/schools (all schools)
router.get('/schools', propertyController.getSchools);

// GET /api/properties/live-search (RapidAPI Zillow provider)
router.get('/live-search', async (req, res) => {
  try {
    const rapidApiService = require('../services/rapidApiService');
    const { location, listingTypes, propertyTypes, sort, page, doz } = req.query;
    const result = await rapidApiService.searchSaleProperties({
      location: location || 'new york',
      listingTypes: listingTypes || 'agent',
      propertyTypes: propertyTypes || 'house',
      sort: sort || 'relevant',
      page: page ? Number(page) : 1,
      doz: doz ? Number(doz) : 7
    });
    return res.status(result.success ? 200 : (result.status || 400)).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/properties/:id (property detail + nearby schools via spatial JOIN)
router.get('/:id', propertyController.getPropertyById);

module.exports = router;
