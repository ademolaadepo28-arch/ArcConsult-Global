// routes/properties.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// GET /api/properties (supports ?bbox=minLng,minLat,maxLng,maxLat or ?lat=&lng=&radius=)
router.get('/', propertyController.getProperties);

// GET /api/properties/schools (all schools)
router.get('/schools', propertyController.getSchools);

// GET /api/properties/:id (property detail + nearby schools via spatial JOIN)
router.get('/:id', propertyController.getPropertyById);

module.exports = router;
