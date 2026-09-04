import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

pg.types.setTypeParser(1082, (value) => value);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
