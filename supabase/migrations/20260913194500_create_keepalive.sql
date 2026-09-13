-- ==============================================================================
-- Migration: Create private keepalive table for background automated activity
-- Purpose: Provide a secure, isolated table for scheduled Edge Function pings
-- ==============================================================================

-- 1. Create dedicated private schema if not exists
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Create private.keepalive table
CREATE TABLE IF NOT EXISTS private.keepalive (
  id integer PRIMARY KEY,
  last_checked_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Seed single row (id = 1)
INSERT INTO private.keepalive (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE private.keepalive ENABLE ROW LEVEL SECURITY;

-- 5. Revoke all access from public client roles (anon, authenticated)
-- Only service_role / superuser can read or write to this schema and table
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
REVOKE ALL ON TABLE private.keepalive FROM anon, authenticated;
