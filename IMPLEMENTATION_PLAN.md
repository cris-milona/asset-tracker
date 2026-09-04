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

**Architecture conventions**
Backend (bulletproof-nodejs inspired) and frontend (bulletproof-react inspired) layouts, scoped to this project's single-resource size:

```
server/src/
  middleware/
    errorHandler.ts
  test-utils/
    express.ts
  db/
    pool.ts
    schema.sql
    seed.ts
  controllers/
    assetController.ts
    __tests__/assetController.test.ts
  routes/
    assetRoutes.ts
  services/
    assetStore.ts          # SQL queries incl. the bbox/PostGIS query later
    __tests__/assetStore.test.ts
  types.ts
  app.ts
  server.ts

client/src/
  store/
    assetsApi.ts            # RTK Query
    filtersSlice.ts         # type/status filters, selected asset, map bounds
    store.ts
    hooks.ts
  components/
    AssetList.tsx
    AssetMap.tsx
    AssetForm.tsx
    AssetDetail.tsx
  pages/
    AssetsPage.tsx           # composes list + map + filters
  types.ts
  App.tsx
  main.tsx
```

Applies from the first backend/frontend scaffolding step onward.

**Additional decisions**
Naming convention: snake_case in the Postgres schema, camelCase in the API responses and frontend — server-side conversion.
Filtering: type and status both support multiple values per field (e.g. ?status=warning,critical), not just a single value.
Bounding box: passed as one comma-separated query param, ?bbox=minLng,minLat,maxLng,maxLat.
Pagination: defaults to 50 items per page; 50 is also the max allowed limit.
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
