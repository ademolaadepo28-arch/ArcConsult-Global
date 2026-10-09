// controllers/portfolioController.js
const db = require('../config/database');

/**
 * Get all bookmarked properties for the authenticated user
 */
async function getSavedPortfolios(req, res) {
  try {
    const userId = req.user.id;
    const isPostgres = db.isConnectedToPostgres();
    const pool = db.getPool();

    if (isPostgres && pool) {
      const query = `
        SELECT sp.property_id, sp.notes, sp.saved_at,
          p.title, p.price_cents, p.property_type, p.bedrooms, p.bathrooms,
          p.square_feet, p.street_address, p.city, p.state, p.zip_code,
          ST_X(p.location::geometry) as lng, ST_Y(p.location::geometry) as lat
        FROM saved_portfolios sp
        JOIN properties p ON p.id = sp.property_id
        WHERE sp.user_id = $1
        ORDER BY sp.saved_at DESC
      `;
      const { rows } = await pool.query(query, [userId]);
      return res.json({ portfolio: rows });
    }

    // Fallback in-memory
    const saved = [];
    for (const [key, item] of db.fallbackPortfolios.entries()) {
      if (item.user_id === userId) {
        const prop = db.fallbackProperties.find((p) => p.id === item.property_id);
        if (prop) {
          saved.push({
            ...item,
            ...prop,
            price_usd: prop.price_cents / 100
          });
        }
      }
    }

    return res.json({ portfolio: saved });
  } catch (error) {
    console.error('Failed to get saved portfolios:', error);
    return res.status(500).json({ error: 'Failed to fetch saved portfolio' });
  }
}

/**
 * Toggle bookmark for a property
 */
async function toggleSaveProperty(req, res) {
  try {
    const userId = req.user.id;
    const { propertyId, notes = '' } = req.body;

    if (!propertyId) {
      return res.status(400).json({ error: 'propertyId is required' });
    }

    const isPostgres = db.isConnectedToPostgres();
    const pool = db.getPool();

    if (isPostgres && pool) {
      // Check if already saved
      const check = await pool.query(
        'SELECT 1 FROM saved_portfolios WHERE user_id = $1 AND property_id = $2',
        [userId, propertyId]
      );

      if (check.rows.length > 0) {
        await pool.query('DELETE FROM saved_portfolios WHERE user_id = $1 AND property_id = $2', [userId, propertyId]);
        return res.json({ saved: false, message: 'Property removed from portfolio' });
      } else {
        await pool.query(
          'INSERT INTO saved_portfolios (user_id, property_id, notes) VALUES ($1, $2, $3)',
          [userId, propertyId, notes]
        );
        return res.json({ saved: true, message: 'Property added to portfolio' });
      }
    }

    // Fallback in-memory
    const key = `${userId}:${propertyId}`;
    if (db.fallbackPortfolios.has(key)) {
      db.fallbackPortfolios.delete(key);
      return res.json({ saved: false, message: 'Property removed from portfolio' });
    } else {
      db.fallbackPortfolios.set(key, {
        user_id: userId,
        property_id: propertyId,
        notes,
        saved_at: new Date().toISOString()
      });
      return res.json({ saved: true, message: 'Property added to portfolio' });
    }
  } catch (error) {
    console.error('Toggle save error:', error);
    return res.status(500).json({ error: 'Failed to update saved portfolio' });
  }
}

module.exports = {
  getSavedPortfolios,
  toggleSaveProperty
};
