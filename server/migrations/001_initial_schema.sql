CREATE TABLE buyers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL
);

CREATE TABLE procurement_records (
  id TEXT PRIMARY KEY,
  stage TEXT NOT NULL, -- One of 'TENDER' or 'CONTRACT'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  publish_date DATE NOT NULL,
  close_date DATE,
  award_date DATE,
  value REAL,
  currency TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

