**Tech Stack**
Backend | Node.js / Express / TypeScript
DB | PostgreSQL + PostGIS
DB access | pg (node-postgres) with raw SQL
Validation | Zod
Frontend | React / TypeScript / MUI
State management | Redux Toolkit + RTK Query
Map | react-leaflet (Leaflet + OpenStreetMap tiles)

**Geospatial approach**
Primary geospatial filter: , matching what's visible on the map (ST_MakeEnvelope+ ST_Intersects).
Storage type: geometry(Point, 4326), not geography — bounding-box comparisons don't need the Earth's curvature accounted for, so geometry is simpler and faster. If radius search is added later, that one calculation gets cast to geography for accurate real-world distance, without changing how the data is stored.
Coordinate order note: PostGIS/GeoJSON use (lng, lat) Leaflet's LatLng uses (lat, lng) A single conversion helper is used everywhere to avoid silent bugs.

**Build order**
Postgres setup + schema + seed — Postgres running locally, assets table with plain lat/lng float columns (no PostGIS yet), seeded from seed.json.
Backend CRUD API — Express + TypeScript endpoints (list/get/create/update/delete), Zod validation, centralized error handling, filter by type/status.
Frontend shell — React + MUI + Redux Toolkit store, RTK Query wired to the API, list view with type/status filter controls.
Map view + create/edit form — react-leaflet markers color-coded by status, marker click opens asset detail, MUI form with a click-on-map location picker, wired to RTK Query mutations.
Introduce PostGIS — enable the extension, migrate lat/lng into a geometry(Point, 4326) column, update read/write queries.
Bounding-box geospatial filter — ST_MakeEnvelope + ST_Intersects driven by Leaflet's current map bounds.
Tests + README + polish — a small set of meaningful tests (bbox query correctness, validation rejection, one CRUD integration test), loading/empty/error states, README write-up.

**Checklist**

- [ ] PostgreSQL running locally, lat/lng initially seeded from seed.json
- [ ] Express + TypeScript CRUD endpoints: list / get / create / update / delete
- [ ] Zod validation for request data
- [ ] Type and status filtering
- [ ] Pagination for the list endpoint
- [ ] React + TypeScript + MUI + Redux Toolkit
- [ ] RTK Query wired to the API
- [ ] List view with type/status filters
- [ ] Map view with react-leaflet
- [ ] Markers color-coded by status
- [ ] Clicking a marker opens the asset detail view
- [ ] Create/edit form
- [ ] Map-based location picker for create/edit
- [ ] PostGIS enabled
- [ ] lat/lng migrated to geometry(Point, 4326)
- [ ] Bounding-box geospatial filter based on the map viewport
- [ ] Delete asset
- [ ] Seed database from seed.json on startup
- [ ] Meaningful tests
- [ ] README with setup/running instructions and architecture/technical decisions

**Out of scope**
Authentication, mobile responsiveness, deployment, exhaustive test coverage, accessibility audits, production observability beyond basic logs.
