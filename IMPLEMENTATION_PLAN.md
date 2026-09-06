**Tech Stack**
Backend | Node.js / Express / TypeScript
DB | PostgreSQL
DB access | pg (node-postgres) with raw SQL
Validation | Zod
Frontend | React / TypeScript / MUI
State management | Redux Toolkit + RTK Query
Map | react-leaflet (Leaflet + OpenStreetMap tiles)

**Geospatial approach**
Primary geospatial filter: bounding box, matching what's visible on the map — a plain SQL `lng BETWEEN ... AND lat BETWEEN ...`, no PostGIS. For an axis-aligned rectangle over flat lat/lng numbers this returns identical rows to a PostGIS `ST_Intersects`/`ST_MakeEnvelope` query, at this dataset's scale, with far less operational cost (no extension, no Postgres version constraint). PostGIS would earn its keep for a within-radius search (real spherical distance) or non-rectangular areas — neither of which this app needs — so it was deliberately left out.
Storage type: plain `lat`/`lng` DOUBLE PRECISION columns, matching the assignment's data contract exactly (no derived/geometry column).

**Architecture conventions**
Backend (bulletproof-nodejs inspired) and frontend (bulletproof-react inspired) layouts, scoped to this project's single-resource size:

```
server/src/
  middleware/
  db/
  controllers/
  routes/
  services/
  types.ts
  app.ts
  server.ts

client/src/
  store/
  components/
  pages/
  schemas/
  utils/
  types.ts
  App.tsx
  main.tsx
```

Applies from the first backend/frontend scaffolding step onward.

**Additional decisions**
Naming convention: snake_case in the Postgres schema, camelCase in the API responses and frontend — server-side conversion.
Filtering: type and status both support multiple values per field (e.g. ?status=warning,critical), not just a single value.
Bounding box: passed as one comma-separated query param, ?bbox=minLng,minLat,maxLng,maxLat.
Pagination: defaults to 10 items per page; 40 is the max allowed limit.
List + map layout: shown side-by-side at once.
Create/edit form: a modal/dialog over the view, not a separate page.
Seed data: seed.json dataset is provided.
Date columns: installed_at and last_inspected_at are plain DATE columns (no time component); last_inspected_at is nullable.

**Code conventions**
TypeScript: strict: true in tsconfig.json on both server and client.
Linting/formatting: ESLint + Prettier on both server/ and client/.
Imports: plain relative imports, no path aliases.
Naming: PascalCase for React component files (AssetForm.tsx), camelCase for everything else (assetStore.ts).
React component exports: default export for components, named exports for everything else (services, hooks, types).
Async error handling: controllers wrapped with an asyncHandler helper so thrown/rejected errors auto-forward to the error middleware, instead of try/catch in every controller.
Backend testing strategy: mock the DB pool for fast unit tests rather than running against a real test database.
Git workflow: a feature branch per phase of the build order, merged into main as each phase completes.
Environment: .env.example committed with placeholder values (DATABASE_URL, PORT); real .env stays gitignored. .nvmrc pins the Node version for reviewers running it locally.
Dependency versions: exact versions in package.json (no caret ranges) via save-exact=true in .npmrc, so installed versions are explicit rather than relying only on the lockfile.

**API response conventions**
Success envelope: list → { data: Asset[], page, limit, total }; single resource → { data: Asset }.
Error envelope: { error: { message, code, details? } } — Zod validation failures populate details with field-level messages.
Status codes: 200 GET/PATCH, 201 POST (create), 204 DELETE (no body), 400 validation, 404 not found, 500 fallback.

**Build order**
Postgres setup + schema + seed — Postgres running locally, assets table with plain lat/lng float columns, seeded from seed.json.
Backend CRUD API — Express + TypeScript endpoints (list/get/create/update/delete), Zod validation, centralized error handling, filter by type/status.
Frontend shell — React + MUI + Redux Toolkit store, RTK Query wired to the API, list view with type/status filter controls.
Map view + create/edit form — react-leaflet markers color-coded by status, marker click opens asset detail, MUI form with a click-on-map location picker, wired to RTK Query mutations.
Bounding-box geospatial filter — plain SQL `lng`/`lat` `BETWEEN` clauses driven by Leaflet's current map bounds.
Tests + README + polish — a small set of meaningful tests (bbox query correctness, validation rejection, one CRUD integration test), loading/empty/error states, README write-up.

**Checklist**

- [x] PostgreSQL running locally, lat/lng initially seeded from seed.json
- [x] Express + TypeScript CRUD endpoints: list / get / create / update / delete
- [x] Zod validation for request data
- [x] Type and status filtering
- [x] Pagination for the list endpoint
- [x] React + TypeScript + MUI + Redux Toolkit
- [x] RTK Query wired to the API
- [x] List view with type/status filters
- [x] Create/edit form
- [x] Delete asset
- [x] Map view with react-leaflet
- [x] Markers color-coded by status
- [x] Clicking a marker opens the asset detail view
- [x] Map-based location picker for create/edit
- [x] Bounding-box geospatial filter based on the map viewport
- [x] Seed database from seed.json on startup
- [x] Meaningful tests
- [x] README with setup/running instructions and architecture/technical decisions

**Out of scope**
Authentication, mobile responsiveness, deployment, exhaustive test coverage, accessibility audits, production observability beyond basic logs.
