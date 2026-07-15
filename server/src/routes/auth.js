/**
 * routes/auth.js — Admin authentication
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/me
 */
import { Router } from 'express';
import argon2     from 'argon2';
import { query }  from '../db/pool.js';
import { requireAuth, issueToken, clearToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { loginRules, handleValidation } from '../middleware/validate.js';

const router = Router();

/** POST /api/auth/login */
router.post('/login', authLimiter, loginRules, handleValidation, async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await query(
      'SELECT id, email, password_hash FROM admins WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    // Use constant-time comparison even for "not found" case
    const admin = result.rows[0];
    const hash  = admin?.password_hash || '$argon2id$v=19$m=65536,t=3,p=1$placeholder';

    const valid = await argon2.verify(hash, password);

    if (!admin || !valid) {
      // Audit failed attempt
      await query(
        `INSERT INTO audit_log (action, metadata, ip_address)
         VALUES ('login_failed', $1, $2)`,
        [JSON.stringify({ email }), req.ip]
      ).catch(() => {});

      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Issue JWT cookie
    issueToken(res, admin);

    // Update last login
    await query(
      'UPDATE admins SET last_login_at = NOW() WHERE id = $1',
      [admin.id]
    );

    // Audit success
    await query(
      `INSERT INTO audit_log (admin_id, action, metadata, ip_address)
       VALUES ($1, 'login_success', $2, $3)`,
      [admin.id, JSON.stringify({ email: admin.email }), req.ip]
    ).catch(() => {});

    return res.json({ success: true, email: admin.email });

  } catch (err) {
    console.error('[auth/login]', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

/** POST /api/auth/logout */
router.post('/logout', requireAuth, async (req, res) => {
  await query(
    `INSERT INTO audit_log (admin_id, action, ip_address) VALUES ($1,'logout',$2)`,
    [req.admin.id, req.ip]
  ).catch(() => {});

  clearToken(res);
  return res.json({ success: true });
});

/** GET /api/auth/me — verify session */
router.get('/me', requireAuth, (req, res) => {
  return res.json({ id: req.admin.id, email: req.admin.email });
});

export default router;
