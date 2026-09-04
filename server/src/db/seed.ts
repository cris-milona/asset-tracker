import dotenv from 'dotenv';
import { pathToFileURL } from 'node:url';
import seedData from './seed.json' with { type: 'json' };
import { pool } from './pool.js';

dotenv.config();

type SeedAsset = {
  id: string;
  name: string;
  type: string;
  status: string;
  lat: number;
  lng: number;
  installed_at: string;
  last_inspected_at: string | null;
  notes: string;
};

const assets = seedData as SeedAsset[];

export const seed = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const asset of assets) {
      await client.query(
        `
          INSERT INTO assets (
            id, name, type, status, lat, lng, installed_at, last_inspected_at, notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            type = EXCLUDED.type,
            status = EXCLUDED.status,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            installed_at = EXCLUDED.installed_at,
            last_inspected_at = EXCLUDED.last_inspected_at,
            notes = EXCLUDED.notes
        `,
        [
          asset.id,
          asset.name,
          asset.type,
          asset.status,
          asset.lat,
          asset.lng,
          asset.installed_at,
          asset.last_inspected_at,
          asset.notes,
        ],
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded ${assets.length} assets.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await seed();
  } finally {
    await pool.end();
  }
}
