CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sensor', 'pipe', 'valve', 'hydrant')),
  status TEXT NOT NULL CHECK (status IN ('ok', 'warning', 'critical')),
  geom geometry(Point, 4326) NOT NULL,
  installed_at DATE NOT NULL,
  last_inspected_at DATE,
  notes TEXT NOT NULL DEFAULT ''
);

-- Speeds up the bounding-box filter's ST_Intersects(geom, ST_MakeEnvelope(...)).
CREATE INDEX IF NOT EXISTS assets_geom_idx ON assets USING GIST (geom);
