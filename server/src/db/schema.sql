-- ============================================================
--  Tejal Desae — Database Schema
--  Run with: psql $DATABASE_URL -f src/db/schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── admins ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- ── leads ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  phone         TEXT,
  program       TEXT        NOT NULL DEFAULT 'money-energetics',
  source        TEXT        NOT NULL DEFAULT 'assessment',  -- 'assessment' | 'form'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes         TEXT,

  -- Enforce one assessment result per email per program
  CONSTRAINT leads_email_program_unique UNIQUE (email, program)
);
CREATE INDEX IF NOT EXISTS leads_email_idx   ON leads (email);
CREATE INDEX IF NOT EXISTS leads_program_idx ON leads (program);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);

-- ── assessment_submissions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_submissions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID        NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  program         TEXT        NOT NULL DEFAULT 'money-energetics',

  -- Raw answers: array of answer codes e.g. ["A","C","B","D","E","A","B","C"]
  raw_answers     JSONB       NOT NULL DEFAULT '[]',

  -- Category scores: {"A":3,"B":1,"C":2,"D":0,"E":2}
  category_scores JSONB       NOT NULL DEFAULT '{}',

  -- Computed results
  top_archetype   CHAR(1)     NOT NULL,  -- A/B/C/D/E
  expansion_score INTEGER     NOT NULL CHECK (expansion_score BETWEEN 0 AND 100),

  -- Hidden coaching data (admin only)
  coaching_notes  TEXT,
  internal_flags  JSONB       NOT NULL DEFAULT '{}',

  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address      TEXT,
  user_agent      TEXT
);
CREATE INDEX IF NOT EXISTS assessment_lead_idx ON assessment_submissions (lead_id);
CREATE INDEX IF NOT EXISTS assessment_arch_idx ON assessment_submissions (top_archetype);

-- ── report_history ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_history (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID        NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  submission_id   UUID        NOT NULL REFERENCES assessment_submissions (id) ON DELETE CASCADE,
  viewed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address      TEXT
);

-- ── audit_log ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID        REFERENCES admins (id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,
  entity      TEXT,
  entity_id   UUID,
  metadata    JSONB       NOT NULL DEFAULT '{}',
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_log (created_at DESC);
