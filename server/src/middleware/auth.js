/**
 * middleware/auth.js — JWT authentication for admin routes
 */
import jwt from 'jsonwebtoken';

/**
 * Verifies the JWT from the HTTP-only cookie.
 * Blocks unauthenticated requests with 401.
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid session.' });
  }
}

/**
 * Signs a JWT for an admin and sets it as an HTTP-only cookie.
 */
export function issueToken(res, admin) {
  const token = jwt.sign(
    { sub: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '8h' }
  );

  res.cookie('admin_token', token, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'strict',
    maxAge:    8 * 60 * 60 * 1000, // 8 hours in ms
    path:      '/',
  });

  return token;
}

/**
 * Clears the auth cookie (logout).
 */
export function clearToken(res) {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
  });
}
