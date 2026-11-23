// api/middleware/auth.js - Authentication middleware

/**
 * authMiddleware - Protects API routes. Attaches req.user if session is valid.
 * Returns 401 if the user is not authenticated.
 */
function authMiddleware(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.user = req.session.user;
  next();
}

module.exports = { authMiddleware };

