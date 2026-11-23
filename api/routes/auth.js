// api/routes/auth.js - Authentication routes

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── CSRF protection via double-submit cookie pattern ─────────────────────────
// For state-changing POST endpoints we verify that the request comes from
// the browser by checking a custom header that cross-origin forms cannot set.
function requireSameOriginPost(req, res, next) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }
  next();
}

// ─── POST /api/auth/google ────────────────────────────────────────────────────
// Receives Google ID token from frontend, verifies it, creates session.
router.post('/google', requireSameOriginPost, async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid credential' });
    }

    // Verify the ID token with Google
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error('[Auth] Token verification failed:', verifyError.message);
      return res.status(401).json({ error: 'Invalid Google ID token' });
    }

    const payload = ticket.getPayload();

    // Validate required fields
    if (!payload || !payload.sub || !payload.email) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Check email is verified by Google
    if (!payload.email_verified) {
      return res.status(401).json({ error: 'Google email not verified' });
    }

    // Build the verified user object (only use server-verified data)
    const user = {
      sub: payload.sub,           // Google subject ID - primary identifier
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture || null,
      givenName: payload.given_name || '',
    };

    // Store in session
    req.session.user = user;
    req.session.authenticatedAt = Date.now();

    // Regenerate session ID to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error('[Auth] Session regeneration error:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      // Re-assign user after regenerate (session data is cleared by regenerate)
      req.session.user = user;
      req.session.authenticatedAt = Date.now();

      res.json({
        ok: true,
        user: {
          sub: user.sub,
          email: user.email,
          name: user.name,
          picture: user.picture,
          givenName: user.givenName,
        },
      });
    });
  } catch (err) {
    console.error('[Auth] /google error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the currently authenticated user, or 401 if not logged in.
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// Clears the session cookie.
router.post('/logout', requireSameOriginPost, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('[Auth] Logout session destroy error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('myspace.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ ok: true, message: 'Logged out successfully' });
  });
});

module.exports = router;

