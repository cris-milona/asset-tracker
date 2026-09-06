import { describe, expect, it } from 'vitest';
import {
  assetInputSchema,
  listQuerySchema,
  parseQueryValues,
  updateAssetBodySchema,
} from '../assetController.js';

describe('parseQueryValues', () => {
  it('returns undefined when the query param is absent', () => {
    expect(parseQueryValues(undefined)).toBeUndefined();
  });

  it('splits a single comma-separated value into an array', () => {
    expect(parseQueryValues('warning,critical')).toEqual(['warning', 'critical']);
  });

  it('flattens an array of values that may themselves contain commas', () => {
    expect(parseQueryValues(['ok', 'warning,critical'])).toEqual(['ok', 'warning', 'critical']);
  });

  it('drops empty segments', () => {
    expect(parseQueryValues('ok,,warning')).toEqual(['ok', 'warning']);
  });
});

describe('listQuerySchema (bbox validation)', () => {
  const base = { page: '1', limit: '10' };

  it('accepts a well-formed bbox', () => {
    const result = listQuerySchema.safeParse({ ...base, bbox: '-71.2,42.2,-70.9,42.5' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bbox).toEqual({ minLng: -71.2, minLat: 42.2, maxLng: -70.9, maxLat: 42.5 });
    }
  });

  it('rejects a bbox with too few numbers', () => {
    const result = listQuerySchema.safeParse({ ...base, bbox: '-71.2,42.2,-70.9' });
    expect(result.success).toBe(false);
  });

  it('rejects a bbox where min is greater than max', () => {
    const result = listQuerySchema.safeParse({ ...base, bbox: '-70.9,42.2,-71.2,42.5' });
    expect(result.success).toBe(false);
  });

  it('rejects a limit above the max page size', () => {
    const result = listQuerySchema.safeParse({ ...base, limit: '41' });
    expect(result.success).toBe(false);
  });
});

describe('assetInputSchema', () => {
  const valid = {
    name: 'Hydrant H-0001',
    type: 'hydrant',
    status: 'ok',
    lat: 42.372111,
    lng: -71.072095,
    installedAt: '1997-01-20',
    lastInspectedAt: null,
    notes: '',
  };

  it('accepts a fully valid asset', () => {
    expect(assetInputSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a blank name', () => {
    const result = assetInputSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an out-of-range latitude', () => {
    const result = assetInputSchema.safeParse({ ...valid, lat: 200 });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown asset type', () => {
    const result = assetInputSchema.safeParse({ ...valid, type: 'pump' });
    expect(result.success).toBe(false);
  });
});

describe('updateAssetBodySchema', () => {
  it('accepts a partial body with at least one field', () => {
    expect(updateAssetBodySchema.safeParse({ name: 'Renamed' }).success).toBe(true);
  });

  it('rejects an empty body', () => {
    expect(updateAssetBodySchema.safeParse({}).success).toBe(false);
  });
});
