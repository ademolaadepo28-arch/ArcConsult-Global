// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'arcconsult-dev-secret-key-2026';
const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';

/**
 * JWT Authentication Middleware
 * Validates bearer token if present, or defaults to demo user for seamless portfolio exploration
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // If token expired or invalid, fall back to demo user with warning header
      res.setHeader('X-Auth-Warning', 'Invalid JWT token, defaulting to demo user');
    }
  }

  // Demo user context
  req.user = {
    id: DEMO_USER_ID,
    email: 'investor@arcconsult.com',
    fullName: 'Alexander Wright'
  };
  next();
}

function generateDemoToken() {
  return jwt.sign(
    { id: DEMO_USER_ID, email: 'investor@arcconsult.com', fullName: 'Alexander Wright' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = {
  authenticate,
  generateDemoToken,
  JWT_SECRET,
  DEMO_USER_ID
};
