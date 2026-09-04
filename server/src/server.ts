import dotenv from 'dotenv';
import { app } from './app.js';
import { seed } from './db/seed.js';
import { pool } from './db/pool.js';

dotenv.config();

const startServer = async (): Promise<void> => {
  await seed();
  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
  });
};

await startServer();

const shutdown = async (): Promise<void> => {
  await pool.end();
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
