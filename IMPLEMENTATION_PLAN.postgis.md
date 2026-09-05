# PostGIS variant

This branch (`postgis-geometry`) is a parallel exploration of the same asset
tracker, swapping the plain `lat`/`lng` storage and bbox filter documented in
IMPLEMENTATION_PLAN.md for PostGIS geometry types. It exists to compare the
two approaches, not to replace the original decision — `main`'s rationale in
IMPLEMENTATION_PLAN.md still stands for that branch.

**What changes from IMPLEMENTATION_PLAN.md**

Storage type: `assets.geom` is a single `geometry(Point, 4326)` column
(SRID 4326 = WGS84, same lat/lng convention Leaflet/OSM use), replacing the
`lat DOUBLE PRECISION` / `lng DOUBLE PRECISION` columns. Points are written
with `ST_SetSRID(ST_MakePoint(lng, lat), 4326)` and read back with
`ST_Y(geom) AS lat, ST_X(geom) AS lng` — the API request/response shape is
unchanged (`lat`/`lng` numbers in JSON); the geometry type is purely a
storage/query-layer detail.

Bounding-box filter: `ST_Intersects(geom, ST_MakeEnvelope(minLng, minLat,
maxLng, maxLat, 4326))` replaces the `lng BETWEEN ... AND lat BETWEEN ...`
clause. A GiST index (`USING GIST (geom)`) replaces the plain btree index on
`(lat, lng)`.

Range validation: the removed columns' `CHECK (lat BETWEEN -90 AND 90)` /
`CHECK (lng BETWEEN -180 AND 180)` constraints are not replaced in SQL —
Zod already enforces the same bounds at the request boundary
(`server/src/controllers/assetController.ts`), so this isn't a gap — that
responsibility already lived there, not in the DB.

Dependency: requires the PostGIS extension enabled on the Postgres instance
(`CREATE EXTENSION IF NOT EXISTS postgis;`) run once via schema.sql. No new
npm packages — geometry is handled with raw SQL `ST_*` functions, consistent
with this project's "pg with raw SQL" convention.

**Everything else** (API conventions, response envelopes, pagination,
frontend architecture, code conventions, out-of-scope items) is unchanged
from IMPLEMENTATION_PLAN.md.

**Build order for this branch**

1. Schema + seed — enable PostGIS, `geom` column, GiST index, seed script
   writes via `ST_MakePoint`.
2. Backend queries — `assetStore.ts` reads/writes through `geom`, bbox filter
   switched to `ST_Intersects`.
3. Tests — update mocked-pool tests and bbox correctness test for the new
   query shape.

Frontend, RTK Query, map view, and forms are unaffected — the API contract
(lat/lng in, lat/lng out) doesn't change, so no client changes are expected.

**Checklist**

- [ ] PostGIS extension enabled; `geom geometry(Point, 4326)` column,
      GiST index, seeded via `ST_MakePoint`
- [ ] `assetStore.ts` reads/writes converted to `ST_X`/`ST_Y`/`ST_MakePoint`
- [ ] Bounding-box filter converted to `ST_Intersects` + `ST_MakeEnvelope`
- [ ] Tests updated for the new query shape
