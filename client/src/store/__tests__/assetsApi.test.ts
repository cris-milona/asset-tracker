import { describe, expect, it } from 'vitest';
import { buildListQuery } from '../assetsApi';

describe('buildListQuery', () => {
  it('includes only page and limit when no filters are set', () => {
    const query = buildListQuery({ page: 1, limit: 10, types: [], statuses: [] });
    expect(query).toBe('page=1&limit=10');
  });

  it('joins multiple types and statuses with commas', () => {
    const query = buildListQuery({
      page: 2,
      limit: 20,
      types: ['sensor', 'valve'],
      statuses: ['warning', 'critical'],
    });
    const params = new URLSearchParams(query);
    expect(params.get('type')).toBe('sensor,valve');
    expect(params.get('status')).toBe('warning,critical');
  });

  it('serializes bbox as minLng,minLat,maxLng,maxLat in that order', () => {
    const query = buildListQuery({
      page: 1,
      limit: 40,
      types: [],
      statuses: [],
      bbox: { minLng: -71.2, minLat: 42.2, maxLng: -70.9, maxLat: 42.5 },
    });
    const params = new URLSearchParams(query);
    expect(params.get('bbox')).toBe('-71.2,42.2,-70.9,42.5');
  });

  it('omits bbox when not provided', () => {
    const query = buildListQuery({ page: 1, limit: 10, types: [], statuses: [], bbox: null });
    expect(new URLSearchParams(query).has('bbox')).toBe(false);
  });
});
