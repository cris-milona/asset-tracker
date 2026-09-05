# Asset Tracker

A small full-stack app for tracking physical assets (pipes, hydrants, sensors, valves) on a
map: list + filter by type/status, view on an interactive map with a geospatial filter, and
create/edit/delete assets with a click-to-place location picker.

- **Backend**: Node.js / Express / TypeScript, PostgreSQL (plain SQL), Zod validation
- **Frontend**: React / TypeScript / MUI, Redux Toolkit + RTK Query, react-leaflet (Leaflet + OpenStreetMap)

## Prerequisites

- Node.js (version pinned in `.nvmrc`; `nvm use` if you have nvm)
- A local PostgreSQL server running (no PostGIS, no Docker required — plain PostgreSQL is enough)

## Setup

1. **Database**: create the database the app expects.

   ```bash
   createdb asset_tracker
   ```

2. **Environment files**: copy the example env files and adjust if your local Postgres connection details differ.

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. **Install dependencies** for both apps.

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

4. **Create the schema**, from `server/`.

   ```bash
   npm run db:setup
   ```

   This creates the `assets` table. Seed data (`server/src/db/seed.json`) is loaded
   automatically every time the server starts — no separate seed step needed, though
   `npm run db:seed` is available to reseed on demand.

## Running

Run both apps in separate terminals.

```bash
# terminal 1, from server/
npm run dev        # API at http://localhost:4000

# terminal 2, from client/
npm run dev        # app at http://localhost:5173 (or the next free port)
```

## Tests

```bash
cd server && npm test
cd client && npm test
```

Backend tests mock the database pool (no test database needed) and cover the list/filter, query-building logic, error-handling middleware, and request validation.
Frontend tests cover the pure logic behind the create/edit form and the list/map query-string building — not the UI libraries themselves (MUI, Leaflet, RTK Query), which are already tested upstream.

## API overview

All endpoints are under `/api/assets`.

| Method | Path   | Description                         |
| ------ | ------ | ----------------------------------- |
| GET    | `/`    | List assets (paginated, filterable) |
| GET    | `/:id` | Get a single asset                  |
| POST   | `/`    | Create an asset                     |
| PATCH  | `/:id` | Update an asset (partial)           |
| DELETE | `/:id` | Delete an asset                     |

## Out of scope

Per the assignment brief: authentication/authorization, mobile responsiveness, deployment (local-run only), exhaustive test coverage, accessibility audits, and production observability beyond basic logs.
