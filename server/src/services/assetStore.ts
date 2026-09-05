import { pool } from '../db/pool.js';
import type {
  Asset,
  AssetBoundingBox,
  AssetInput,
  AssetPagination,
  AssetStatus,
  AssetType,
} from '../types.js';

type AssetRow = {
  id: string;
  name: string;
  type: Asset['type'];
  status: Asset['status'];
  lat: number;
  lng: number;
  installed_at: string;
  last_inspected_at: string | null;
  notes: string;
};
const toAsset = (row: AssetRow): Asset => ({
  id: row.id,
  name: row.name,
  type: row.type,
  status: row.status,
  lat: row.lat,
  lng: row.lng,
  installedAt: row.installed_at,
  lastInspectedAt: row.last_inspected_at,
  notes: row.notes,
});

const assetColumns = `
  id, name, type, status, ST_Y(geom) AS lat, ST_X(geom) AS lng,
  installed_at, last_inspected_at, notes
`;

export const listAssets = async ({
  page,
  limit,
  types,
  statuses,
  bbox,
}: AssetPagination & {
  types?: AssetType[];
  statuses?: AssetStatus[];
  bbox?: AssetBoundingBox;
}): Promise<{ assets: Asset[]; total: number }> => {
  const values: Array<number | string[]> = [];
  const conditions: string[] = [];

  if (types?.length) {
    values.push(types);
    conditions.push(`type = ANY($${values.length}::text[])`);
  }

  if (statuses?.length) {
    values.push(statuses);
    conditions.push(`status = ANY($${values.length}::text[])`);
  }

  if (bbox) {
    values.push(bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat);
    const [minLngParam, minLatParam, maxLngParam, maxLatParam] = [3, 2, 1, 0].map(
      (offset) => `$${values.length - offset}`,
    );
    //search from the db the points that exist inside the rectangle
    conditions.push(
      `ST_Intersects(geom, ST_MakeEnvelope(${minLngParam}, ${minLatParam}, ${maxLngParam}, ${maxLatParam}, 4326))`,
    );
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM assets ${whereClause}`,
    values,
  );
  const offset = (page - 1) * limit;
  const dataValues = [...values, limit, offset];
  const result = await pool.query<AssetRow>(
    `
      SELECT ${assetColumns}
      FROM assets
      ${whereClause}
      ORDER BY name, id
      LIMIT $${dataValues.length - 1}
      OFFSET $${dataValues.length}
    `,
    dataValues,
  );
  //Without a defined sort order, Postgres doesn't guarantee it'll return rows in the same order every time you query — which would mean page 1 and page 2 could occasionally show overlapping or missing assets between requests.
  return {
    assets: result.rows.map(toAsset),
    total: Number(countResult.rows[0]?.count ?? 0),
  };
};

export const getAsset = async (id: string): Promise<Asset | null> => {
  const result = await pool.query<AssetRow>(`SELECT ${assetColumns} FROM assets WHERE id = $1`, [
    id,
  ]);

  return result.rows[0] ? toAsset(result.rows[0]) : null;
};

export const createAsset = async (id: string, input: AssetInput): Promise<Asset> => {
  const result = await pool.query<AssetRow>(
    `
      INSERT INTO assets (
        id, name, type, status, geom, installed_at, last_inspected_at, notes
      )
      VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, $9)
      RETURNING ${assetColumns}
    `,
    [
      id,
      input.name,
      input.type,
      input.status,
      input.lng,
      input.lat,
      input.installedAt,
      input.lastInspectedAt,
      input.notes,
    ],
  );

  return toAsset(result.rows[0]);
};

const updateColumns: Record<Exclude<keyof AssetInput, 'lat' | 'lng'>, string> = {
  name: 'name',
  type: 'type',
  status: 'status',
  installedAt: 'installed_at',
  lastInspectedAt: 'last_inspected_at',
  notes: 'notes',
};

export const updateAsset = async (
  id: string,
  input: Partial<AssetInput>,
): Promise<Asset | null> => {
  const fields = (Object.entries(input) as Array<[keyof AssetInput, unknown]>)
    .filter(
      (entry): entry is [Exclude<keyof AssetInput, 'lat' | 'lng'>, unknown] =>
        entry[1] !== undefined && entry[0] !== 'lat' && entry[0] !== 'lng',
    )
    .map(([key, value]): [string, unknown] => [updateColumns[key], value]);

  if (!fields.length && input.lat === undefined && input.lng === undefined) {
    return getAsset(id);
  }

  const values = fields.map(([, value]) => value);
  const assignments = fields.map(([column], index) => `${column} = $${index + 1}`);

  if (input.lat !== undefined || input.lng !== undefined) {
    const lngExpr = input.lng !== undefined ? `$${values.length + 1}` : 'ST_X(geom)';
    if (input.lng !== undefined) values.push(input.lng);
    const latExpr = input.lat !== undefined ? `$${values.length + 1}` : 'ST_Y(geom)';
    if (input.lat !== undefined) values.push(input.lat);
    assignments.push(`geom = ST_SetSRID(ST_MakePoint(${lngExpr}, ${latExpr}), 4326)`);
  }

  values.push(id);

  const result = await pool.query<AssetRow>(
    `
      UPDATE assets
      SET ${assignments.join(', ')}
      WHERE id = $${values.length}
      RETURNING ${assetColumns}
    `,
    values,
  );

  return result.rows[0] ? toAsset(result.rows[0]) : null;
};

export const deleteAsset = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM assets WHERE id = $1', [id]);
  return result.rowCount === 1;
};
