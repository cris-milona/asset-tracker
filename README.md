# Asset Tracker

## Local PostgreSQL setup

This project uses a local PostgreSQL installation. Docker is not required.

The application expects a database named `asset_tracker` and connects using the
`DATABASE_URL` in `server/.env`:

```dotenv
DATABASE_URL=postgres://localhost:5432/asset_tracker
```

Create the database if needed, then run the schema setup from `server/`:

```bash
createdb asset_tracker
npm run db:setup
```

The schema setup creates the `assets` table. The server seeds the table from
`server/src/db/seed.json` when it starts. To seed manually:

```bash
npm run db:seed
```

## Run the server

From the `server/` directory:

```bash
npm install
npm run dev
```

The API runs at `http://localhost:4000`.

## Stop and restart locally

Stop the Node server with `Ctrl+C`. Its shutdown handler closes the application
connection pool. PostgreSQL remains available and the database data is retained.

Because PostgreSQL is managed locally through Homebrew, it can also be stopped
when you are finished working:

```bash
brew services stop postgresql@16
```

Start it again before running the server:

```bash
brew services start postgresql@16
```

Stopping PostgreSQL does not delete the `asset_tracker` database.
