// controllers/propertyController.js
const spatialService = require('../services/spatialService');
const db = require('../config/database');

/**
 * Controller for Geospatial Property Search
 */
async function getProperties(req, res) {
  try {
    const startTime = Date.now();
    const {
      bbox, // format: "minLng,minLat,maxLng,maxLat"
      lat,
      lng,
      radius = 5000,
      minPrice,
      maxPrice,
      minBeds,
      propertyType,
      format = 'geojson'
    } = req.query;

    const filters = {
      minPriceCents: minPrice ? Math.round(Number(minPrice) * 100) : undefined,
      maxPriceCents: maxPrice ? Math.round(Number(maxPrice) * 100) : undefined,
      minBeds: minBeds ? Number(minBeds) : undefined,
      propertyType: propertyType ? propertyType.toUpperCase() : undefined
    };

    let properties = [];

    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
      properties = await spatialService.searchByBoundingBox(minLng, minLat, maxLng, maxLat, filters);
    } else if (lat && lng) {
      properties = await spatialService.searchByRadius(Number(lng), Number(lat), Number(radius), filters);
    } else {
      // Default Austin downtown center radius 15km
      properties = await spatialService.searchByRadius(-97.7431, 30.2672, 15000, filters);
    }

    const durationMs = Date.now() - startTime;

    if (format === 'geojson') {
      const geojson = spatialService.toGeoJSON(properties);
      return res.json({
        ...geojson,
        meta: {
          count: properties.length,
          executionTimeMs: durationMs,
          engine: db.getDatabaseStatus().engine
        }
      });
    }

    return res.json({
      properties,
      meta: {
        count: properties.length,
        executionTimeMs: durationMs,
        engine: db.getDatabaseStatus().engine
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return res.status(500).json({ error: 'Failed to execute geospatial property query' });
  }
}

/**
 * Retrieve single property details with nearby schools via spatial JOIN
 */
async function getPropertyById(req, res) {
  try {
    const { id } = req.params;
    const isPostgres = db.isConnectedToPostgres();
    const pool = db.getPool();

    let property = null;

    if (isPostgres && pool) {
      const query = `
        SELECT id, title, description, property_type, status, price_cents,
          estimated_hoa_monthly_cents, annual_property_tax_cents, bedrooms,
          bathrooms, square_feet, year_built, street_address, city, state, zip_code,
          image_url, alt_image_url,
          ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat
        FROM properties WHERE id = $1
      `;
      const { rows } = await pool.query(query, [id]);
      property = rows[0];
    } else {
      property = db.fallbackProperties.find((p) => p.id === id);
    }

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Perform PostGIS spatial join to fetch nearby schools within 5km
    const schools = await spatialService.getNearbySchools(id, 5000);

    return res.json({
      property: {
        ...property,
        price_usd: property.price_cents / 100,
        hoa_monthly_usd: (property.estimated_hoa_monthly_cents || 0) / 100,
        annual_tax_usd: property.annual_property_tax_cents / 100
      },
      schools
    });
  } catch (error) {
    console.error('Error fetching property details:', error);
    return res.status(500).json({ error: 'Failed to load property details' });
  }
}

/**
 * Retrieve all schools
 */
async function getSchools(req, res) {
  try {
    const isPostgres = db.isConnectedToPostgres();
    const pool = db.getPool();

    if (isPostgres && pool) {
      const { rows } = await pool.query(`
        SELECT id, name, rating, school_type,
          ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat
        FROM schools
      `);
      return res.json({ schools: rows });
    }

    return res.json({ schools: db.fallbackSchools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return res.status(500).json({ error: 'Failed to fetch schools' });
  }
}

module.exports = {
  getProperties,
  getPropertyById,
  getSchools
};
