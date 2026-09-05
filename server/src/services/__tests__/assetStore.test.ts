import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../db/pool.js', () => ({
  pool: { query: vi.fn() },
}));

import { pool } from '../../db/pool.js';
import {
  createAsset,
  deleteAsset,
  getAsset,
  listAssets,
  updateAsset,
} from '../assetStore.js';
import type { AssetInput } from '../../types.js';

const query = vi.mocked(pool.query);

const row = {
  id: '1',
  name: 'Hydrant H-0001',
  type: 'hydrant',
  status: 'ok',
  lat: 42.372111,
  lng: -71.072095,
  installed_at: '1997-01-20',
  last_inspected_at: '2010-01-13',
  notes: '',
};

beforeEach(() => {
  query.mockReset();
});

describe('listAssets', () => {
  it('queries with no WHERE clause when no filters are given', async () => {
    query.mockResolvedValueOnce({ rows: [{ count: '0' }] } as never);
    query.mockResolvedValueOnce({ rows: [] } as never);

    await listAssets({ page: 1, limit: 10 });

    const [countSql, countValues] = query.mock.calls[0];
    const [dataSql, dataValues] = query.mock.calls[1];
    expect(countSql).not.toContain('WHERE');
    expect(countValues).toEqual([]);
    expect(dataSql).not.toContain('WHERE');
    expect(dataValues).toEqual([10, 0]);
  });

  it('builds a type/status filter using ANY($n::text[])', async () => {
    query.mockResolvedValueOnce({ rows: [{ count: '0' }] } as never);
    query.mockResolvedValueOnce({ rows: [] } as never);

    await listAssets({
      page: 1,
      limit: 10,
      types: ['sensor', 'valve'],
      statuses: ['critical'],
    });

    const [sql, values] = query.mock.calls[1];
    expect(sql).toContain('type = ANY($1::text[])');
    expect(sql).toContain('status = ANY($2::text[])');
    expect(values).toEqual([['sensor', 'valve'], ['critical'], 10, 0]);
  });

  it('builds a bbox filter as ST_Intersects/ST_MakeEnvelope with minLng,minLat,maxLng,maxLat param order', async () => {
    query.mockResolvedValueOnce({ rows: [{ count: '0' }] } as never);
    query.mockResolvedValueOnce({ rows: [] } as never);

    await listAssets({
      page: 1,
      limit: 40,
      bbox: { minLng: -71.2, minLat: 42.2, maxLng: -70.9, maxLat: 42.5 },
    });

    const [sql, values] = query.mock.calls[1];
    expect(sql).toContain('ST_Intersects(geom, ST_MakeEnvelope($1, $2, $3, $4, 4326))');
    expect(values).toEqual([-71.2, 42.2, -70.9, 42.5, 40, 0]);
  });

  it('keeps correct param indices when combining type/status filters with bbox', async () => {
    query.mockResolvedValueOnce({ rows: [{ count: '0' }] } as never);
    query.mockResolvedValueOnce({ rows: [] } as never);

    await listAssets({
      page: 2,
      limit: 10,
      types: ['hydrant'],
      bbox: { minLng: -71.2, minLat: 42.2, maxLng: -70.9, maxLat: 42.5 },
    });

    const [sql, values] = query.mock.calls[1];
    expect(sql).toContain('type = ANY($1::text[])');
    expect(sql).toContain('ST_Intersects(geom, ST_MakeEnvelope($2, $3, $4, $5, 4326))');
    expect(values).toEqual([['hydrant'], -71.2, 42.2, -70.9, 42.5, 10, 10]);
  });

  it('maps rows to Asset objects and returns the total count', async () => {
    query.mockResolvedValueOnce({ rows: [{ count: '1' }] } as never);
    query.mockResolvedValueOnce({ rows: [row] } as never);

    const result = await listAssets({ page: 1, limit: 10 });

    expect(result.total).toBe(1);
    expect(result.assets).toEqual([
      {
        id: '1',
        name: 'Hydrant H-0001',
        type: 'hydrant',
        status: 'ok',
        lat: 42.372111,
        lng: -71.072095,
        installedAt: '1997-01-20',
        lastInspectedAt: '2010-01-13',
        notes: '',
      },
    ]);
  });
});

describe('getAsset', () => {
  it('returns null when no row is found', async () => {
    query.mockResolvedValueOnce({ rows: [] } as never);
    expect(await getAsset('missing')).toBeNull();
  });

  it('maps the found row to an Asset', async () => {
    query.mockResolvedValueOnce({ rows: [row] } as never);
    const asset = await getAsset('1');
    expect(asset?.name).toBe('Hydrant H-0001');
  });
});

describe('createAsset', () => {
  it('inserts using the input fields in order and returns the mapped asset', async () => {
    query.mockResolvedValueOnce({ rows: [row] } as never);

    const input: AssetInput = {
      name: 'Hydrant H-0001',
      type: 'hydrant',
      status: 'ok',
      lat: 42.372111,
      lng: -71.072095,
      installedAt: '1997-01-20',
      lastInspectedAt: '2010-01-13',
      notes: '',
    };
    const asset = await createAsset('1', input);

    const [, values] = query.mock.calls[0];
    expect(values).toEqual([
      '1',
      'Hydrant H-0001',
      'hydrant',
      'ok',
      -71.072095,
      42.372111,
      '1997-01-20',
      '2010-01-13',
      '',
    ]);
    expect(asset.name).toBe('Hydrant H-0001');
  });
});

describe('updateAsset', () => {
  it('only sets the columns present in the partial input', async () => {
    query.mockResolvedValueOnce({ rows: [row] } as never);

    await updateAsset('1', { name: 'Renamed', status: 'warning' });

    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('name = $1');
    expect(sql).toContain('status = $2');
    expect(values).toEqual(['Renamed', 'warning', '1']);
  });

  it('builds a full geom point when both lat and lng are given', async () => {
    query.mockResolvedValueOnce({ rows: [row] } as never);

    await updateAsset('1', { lat: 42.5, lng: -71.0 });

    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)');
    expect(values).toEqual([-71.0, 42.5, '1']);
  });

  it('falls back to the existing coordinate when only one of lat/lng is given', async () => {
    query.mockResolvedValueOnce({ rows: [row] } as never);

    await updateAsset('1', { lat: 42.5 });

    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('geom = ST_SetSRID(ST_MakePoint(ST_X(geom), $1), 4326)');
    expect(values).toEqual([42.5, '1']);
  });

  it('skips the UPDATE entirely and just re-fetches when given no fields', async () => {
    query.mockResolvedValueOnce({ rows: [row] } as never);

    await updateAsset('1', {});

    expect(query).toHaveBeenCalledTimes(1);
    const [sql] = query.mock.calls[0];
    expect(sql).toContain('SELECT');
    expect(sql).not.toContain('UPDATE');
  });
});

describe('deleteAsset', () => {
  it('returns true when a row was deleted', async () => {
    query.mockResolvedValueOnce({ rowCount: 1 } as never);
    expect(await deleteAsset('1')).toBe(true);
  });

  it('returns false when nothing matched the id', async () => {
    query.mockResolvedValueOnce({ rowCount: 0 } as never);
    expect(await deleteAsset('missing')).toBe(false);
  });
});
