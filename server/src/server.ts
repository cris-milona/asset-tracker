import { seed } from './db/seed.js';

const startServer = async (): Promise<void> => {
  await seed();
};

await startServer();
