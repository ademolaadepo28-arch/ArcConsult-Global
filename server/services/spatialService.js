// services/spatialService.js
const db = require('../config/database');

/**
 * Great-circle distance between two coordinates in meters (Haversine formula).
 * Replicates ST_Distance(geography, geography) behavior.
 */
function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Searches properties by bounding box envelope (ST_MakeEnvelope equivalent)
 * @param {number} minLng - South-West Longitude
 * @param {number} minLat - South-West Latitude
 * @param {number} maxLng - North-East Longitude
 * @param {number} maxLat - North-East Latitude
 * @param {object} filters - Additional query filters (minPrice, maxPrice, bedrooms, propertyType)
 */
async function searchByBoundingBox(minLng, minLat, maxLng, maxLat, filters = {}) {
  const isPostgres = db.isConnectedToPostgres();
  const pool = db.getPool();

  if (isPostgres && pool) {
    let query = `
      SELECT id, title, description, property_type, status, price_cents,
        estimated_hoa_monthly_cents, annual_property_tax_cents, bedrooms,
        bathrooms, square_feet, year_built, street_address, city, state, zip_code,
        ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat
      FROM properties
      WHERE location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
    `;
    const params = [minLng, minLat, maxLng, maxLat];
    let paramIdx = 5;

    if (filters.minPriceCents) {
      query += ` AND price_cents >= $${paramIdx++}`;
      params.push(filters.minPriceCents);
    }
    if (filters.maxPriceCents) {
      query += ` AND price_cents <= $${paramIdx++}`;
      params.push(filters.maxPriceCents);
    }
    if (filters.minBeds) {
      query += ` AND bedrooms >= $${paramIdx++}`;
      params.push(filters.minBeds);
    }
    if (filters.propertyType && filters.propertyType !== 'ALL') {
      query += ` AND property_type = $${paramIdx++}`;
      params.push(filters.propertyType);
    }

    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Fallback in-memory spatial search
  return db.fallbackProperties.filter((p) => {
    const insideBbox =
      p.lng >= minLng && p.lng <= maxLng &&
      p.lat >= minLat && p.lat <= maxLat;

    if (!insideBbox) return false;
    if (filters.minPriceCents && p.price_cents < filters.minPriceCents) return false;
    if (filters.maxPriceCents && p.price_cents > filters.maxPriceCents) return false;
    if (filters.minBeds && p.bedrooms < filters.minBeds) return false;
    if (filters.propertyType && filters.propertyType !== 'ALL' && p.property_type !== filters.propertyType) return false;

    return true;
  });
}

/**
 * Searches properties within a radius (ST_DWithin equivalent)
 * @param {number} centerLng - Center Longitude
 * @param {number} centerLat - Center Latitude
 * @param {number} radiusMeters - Search radius in meters (e.g. 5000 = 5km)
 * @param {object} filters - Additional criteria
 */
async function searchByRadius(centerLng, centerLat, radiusMeters = 5000, filters = {}) {
  const isPostgres = db.isConnectedToPostgres();
  const pool = db.getPool();

  if (isPostgres && pool) {
    let query = `
      SELECT id, title, description, property_type, status, price_cents,
        estimated_hoa_monthly_cents, annual_property_tax_cents, bedrooms,
        bathrooms, square_feet, year_built, street_address, city, state, zip_code,
        ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat,
        ROUND(ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)) AS distance_meters
      FROM properties
      WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
    `;
    const params = [centerLng, centerLat, radiusMeters];
    let paramIdx = 4;

    if (filters.minPriceCents) {
      query += ` AND price_cents >= $${paramIdx++}`;
      params.push(filters.minPriceCents);
    }
    if (filters.maxPriceCents) {
      query += ` AND price_cents <= $${paramIdx++}`;
      params.push(filters.maxPriceCents);
    }
    if (filters.minBeds) {
      query += ` AND bedrooms >= $${paramIdx++}`;
      params.push(filters.minBeds);
    }
    if (filters.propertyType && filters.propertyType !== 'ALL') {
      query += ` AND property_type = $${paramIdx++}`;
      params.push(filters.propertyType);
    }

    query += ' ORDER BY distance_meters ASC';
    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Fallback in-memory ST_DWithin
  const results = [];
  for (const p of db.fallbackProperties) {
    const dist = haversineDistanceMeters(centerLat, centerLng, p.lat, p.lng);
    if (dist <= radiusMeters) {
      if (filters.minPriceCents && p.price_cents < filters.minPriceCents) continue;
      if (filters.maxPriceCents && p.price_cents > filters.maxPriceCents) continue;
      if (filters.minBeds && p.bedrooms < filters.minBeds) continue;
      if (filters.propertyType && filters.propertyType !== 'ALL' && p.property_type !== filters.propertyType) continue;

      results.push({
        ...p,
        distance_meters: dist
      });
    }
  }

  return results.sort((a, b) => a.distance_meters - b.distance_meters);
}

/**
 * PostGIS Spatial JOIN: Retrieve schools nearby a specific property
 */
async function getNearbySchools(propertyId, maxDistanceMeters = 5000) {
  const isPostgres = db.isConnectedToPostgres();
  const pool = db.getPool();

  if (isPostgres && pool) {
    const query = `
      SELECT s.id, s.name, s.rating, s.school_type,
        ST_X(s.location::geometry) as lng, ST_Y(s.location::geometry) as lat,
        ROUND(ST_Distance(s.location::geography, p.location::geography)) AS distance_meters
      FROM schools s
      JOIN properties p ON p.id = $1
      WHERE ST_DWithin(s.location::geography, p.location::geography, $2)
      ORDER BY distance_meters ASC
    `;
    const { rows } = await pool.query(query, [propertyId, maxDistanceMeters]);
    return rows;
  }

  // Fallback spatial join
  const property = db.fallbackProperties.find((p) => p.id === propertyId);
  if (!property) return [];

  const schools = db.fallbackSchools.map((s) => {
    const dist = haversineDistanceMeters(property.lat, property.lng, s.lat, s.lng);
    return {
      ...s,
      distance_meters: dist
    };
  }).filter((s) => s.distance_meters <= maxDistanceMeters);

  return schools.sort((a, b) => a.distance_meters - b.distance_meters);
}

/**
 * Builds standard GeoJSON FeatureCollection from properties
 */
function toGeoJSON(propertiesList) {
  return {
    type: 'FeatureCollection',
    features: propertiesList.map((p) => ({
      type: 'Feature',
      id: p.id,
      geometry: {
        type: 'Point',
        coordinates: [p.lng, p.lat]
      },
      properties: {
        id: p.id,
        title: p.title,
        price_cents: p.price_cents,
        price_usd: p.price_cents / 100,
        property_type: p.property_type,
        status: p.status,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        square_feet: p.square_feet,
        year_built: p.year_built,
        street_address: p.street_address,
        city: p.city,
        state: p.state,
        zip_code: p.zip_code,
        distance_meters: p.distance_meters || null,
        annual_property_tax_cents: p.annual_property_tax_cents,
        estimated_hoa_monthly_cents: p.estimated_hoa_monthly_cents,
        estimated_monthly_rent_cents: p.estimated_monthly_rent_cents
      }
    }))
  };
}

module.exports = {
  searchByBoundingBox,
  searchByRadius,
  getNearbySchools,
  toGeoJSON,
  haversineDistanceMeters
};
