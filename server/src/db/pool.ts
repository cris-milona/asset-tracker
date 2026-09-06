import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();
// OID 1082 is DATE. Keep it as a raw string instead of pg's default Date object —
// a Date implies midnight UTC, which can roll back a day in timezones behind UTC.
pg.types.setTypeParser(1082, (value) => value);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
