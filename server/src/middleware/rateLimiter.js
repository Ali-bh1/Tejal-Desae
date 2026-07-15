/**
 * middleware/rateLimiter.js — Rate limiting for sensitive endpoints
 */
import rateLimit from 'express-rate-limit';

/** General API limit — 100 req / 15 min per IP */
export const apiLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              100,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: 'Too many requests. Please try again later.' },
});

/** Assessment submission — 10 per hour per IP */
export const assessmentLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: 'Too many assessment submissions. Please try again later.' },
});

/** Auth endpoints — 5 attempts per 15 min per IP */
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: 'Too many login attempts. Please try again in 15 minutes.' },
});
