/**
 * src/index.js — Express server entry point
 */
import 'dotenv/config';
import express        from 'express';
import helmet         from 'helmet';
import cors           from 'cors';
import cookieParser   from 'cookie-parser';
import morgan         from 'morgan';
import path           from 'path';
import { fileURLToPath } from 'url';

import assessmentRouter from './routes/assessment.js';
import authRouter       from './routes/auth.js';
import adminRouter      from './routes/admin.js';
import { apiLimiter }   from './middleware/rateLimiter.js';
import pool             from './db/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security headers ──────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (same-origin, Postman, curl)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// ── Body parsing + cookies ────────────────────────────────────────
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));
app.use(cookieParser());

// ── Request logging ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Trust proxy (for correct req.ip behind Nginx/Railway/Render) ─
app.set('trust proxy', 1);

// ── API routes ────────────────────────────────────────────────────
app.use('/api/assessment', assessmentRouter);
app.use('/api/auth',       authRouter);
app.use('/api/admin',      adminRouter);

// ── General rate limit for everything else ────────────────────────
app.use('/api', apiLimiter);

// ── Serve admin dashboard SPA ────────────────────────────────────
// The admin dashboard lives at /admin (HTML file served from server/public/admin)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(publicDir, 'admin', 'index.html'));
});
app.get('/admin/*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'admin', 'index.html'));
});

// ── Health check ──────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', db: 'connected', env: process.env.NODE_ENV });
  } catch {
    return res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[server error]', err.message);
  const status = err.status || err.statusCode || 500;
  const msg    = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred.'
    : err.message;
  res.status(status).json({ error: msg });
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Tejal Desae server running on port ${PORT}`);
  console.log(`   ENV:    ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Admin:  http://localhost:${PORT}/admin\n`);
});

export default app;
