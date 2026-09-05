CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sensor', 'pipe', 'valve', 'hydrant')),
  status TEXT NOT NULL CHECK (status IN ('ok', 'warning', 'critical')),
  lat DOUBLE PRECISION NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng DOUBLE PRECISION NOT NULL CHECK (lng BETWEEN -180 AND 180),
  installed_at DATE NOT NULL,
  last_inspected_at DATE,
  notes TEXT NOT NULL DEFAULT ''
);

-- Speeds up the bounding-box filter's `lng BETWEEN ... AND lat BETWEEN ...`.
CREATE INDEX IF NOT EXISTS assets_lat_lng_idx ON assets (lat, lng);
