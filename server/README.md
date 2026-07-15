# Tejal Desae — Backend Server

Express + PostgreSQL backend for the Wealth Expansion Assessment, admin dashboard, lead management, and secure report generation.

---

## Quick Start

### 1. Install PostgreSQL

- **Local (Windows):** Download from https://www.postgresql.org/download/windows/
- **Cloud (recommended):** [Railway](https://railway.app) · [Supabase](https://supabase.com) · [Render](https://render.com/docs/postgresql)

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, CSRF_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
```

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Install dependencies

```bash
cd server
npm install
```

### 4. Apply database schema

```bash
npm run db:migrate
```

### 5. Create first admin account

```bash
npm run db:seed
```

### 6. Start the server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:3000`  
Admin dashboard: `http://localhost:3000/admin`  
Health check: `http://localhost:3000/health`

---

## API Reference

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/assessment/submit` | Submit assessment answers + lead info |
| `GET`  | `/api/assessment/result/:id` | Get client-visible report by submission ID |

### Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Admin login (returns HTTP-only JWT cookie) |
| `POST` | `/api/auth/logout` | Clear session |
| `GET`  | `/api/auth/me` | Verify current session |

### Admin Endpoints (require auth cookie)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/dashboard` | Overview stats |
| `GET` | `/api/admin/leads` | Paginated leads — supports `search`, `program`, `archetype`, `page`, `limit` |
| `GET` | `/api/admin/leads/:id` | Single lead with submission history |
| `PATCH` | `/api/admin/leads/:id/notes` | Update coaching notes |
| `GET` | `/api/admin/submissions/:id` | Full submission including coaching data |
| `PATCH` | `/api/admin/submissions/:id/notes` | Update coaching notes on submission |
| `GET` | `/api/admin/export/csv` | Download all leads as CSV |
| `GET` | `/api/admin/audit` | Audit log |

---

## Security Features

- **Argon2id** password hashing (memory-hard, OWASP recommended)
- **HTTP-only JWT cookie** — token never accessible to JavaScript
- **Helmet** — sets 14 security headers including CSP, HSTS, X-Frame-Options
- **Rate limiting** — 5 login attempts / 15 min, 10 assessments / hour, 100 API calls / 15 min
- **Input validation** — express-validator on all inputs, parameterised SQL queries (no string interpolation)
- **CORS** — strict allowlist
- **Audit logging** — every admin action recorded with timestamp and IP
- **Scoring on server** — clients never see the scoring algorithm or coaching notes

---

## Deployment (Railway recommended)

1. Create a Railway project
2. Add a PostgreSQL plugin
3. Add a Node.js service pointing to the `server/` folder
4. Set environment variables from `.env.example`
5. Set `START_COMMAND` to `npm start`
6. Run `npm run db:migrate` and `npm run db:seed` via Railway shell

---

## Folder Structure

```
server/
├── .env.example
├── package.json
├── README.md
├── public/
│   └── admin/
│       ├── index.html      ← Admin login + SPA shell
│       ├── dashboard.css   ← Admin styles
│       └── dashboard.js    ← Admin SPA (vanilla JS)
└── src/
    ├── index.js            ← Express app entry
    ├── db/
    │   ├── pool.js         ← PostgreSQL connection pool
    │   ├── schema.sql      ← Database schema
    │   ├── migrate.js      ← Apply schema
    │   └── seed.js         ← Create first admin
    ├── middleware/
    │   ├── auth.js         ← JWT verify/issue/clear
    │   ├── rateLimiter.js  ← Rate limiting rules
    │   └── validate.js     ← Input validation rules
    ├── routes/
    │   ├── assessment.js   ← Assessment submit + result
    │   ├── auth.js         ← Login / logout / me
    │   └── admin.js        ← All admin CRUD endpoints
    └── services/
        └── scoring.js      ← Server-side scoring engine (hidden from clients)
```
