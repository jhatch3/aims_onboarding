-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to run multiple times (IF NOT EXISTS)

-- Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('OWNER', 'OPERATOR', 'VIEWER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE machine_status AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  role       user_role NOT NULL DEFAULT 'OPERATOR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machines (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  location   TEXT NOT NULL,
  latitude   FLOAT,
  longitude  FLOAT,
  status     machine_status NOT NULL DEFAULT 'ONLINE',
  owner_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  category  TEXT NOT NULL,
  cost      FLOAT NOT NULL,
  price     FLOAT NOT NULL,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position    INT NOT NULL,
  machine_id  UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  current_qty INT NOT NULL,
  max_qty     INT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity   INT NOT NULL DEFAULT 1,
  amount     FLOAT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machine_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  details    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_machine_id  ON transactions(machine_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id  ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at  ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slots_machine_id         ON slots(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_events_machine_id ON machine_events(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_events_type      ON machine_events(type);
