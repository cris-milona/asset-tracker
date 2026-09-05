import { describe, expect, it } from 'vitest';
import { emptyValues, getFieldErrors, toAssetInput, toFormValues } from '../assetFormValues';
import type { Asset } from '../../types';

const asset: Asset = {
  id: '1',
  name: 'Hydrant H-0001',
  type: 'hydrant',
  status: 'ok',
  lat: 42.372111,
  lng: -71.072095,
  installedAt: '1997-01-20',
  lastInspectedAt: '2010-01-13',
  notes: 'Some notes',
};

describe('toFormValues', () => {
  it('maps an asset onto form values, deriving location from lat/lng', () => {
    expect(toFormValues(asset)).toEqual({
      name: 'Hydrant H-0001',
      type: 'hydrant',
      status: 'ok',
      location: { lat: 42.372111, lng: -71.072095 },
      installedAt: '1997-01-20',
      lastInspectedAt: '2010-01-13',
      notes: 'Some notes',
    });
  });

  it('falls back to an empty string when lastInspectedAt is null', () => {
    expect(toFormValues({ ...asset, lastInspectedAt: null }).lastInspectedAt).toBe('');
  });
});

describe('toAssetInput', () => {
  it('trims the name and keeps other fields as-is', () => {
    const input = toAssetInput({ ...toFormValues(asset), name: '  Hydrant H-0001  ' });
    expect(input.name).toBe('Hydrant H-0001');
  });

  it('uses NaN for lat/lng when no location has been picked', () => {
    const input = toAssetInput({ ...emptyValues, name: 'New asset' });
    expect(input.lat).toBeNaN();
    expect(input.lng).toBeNaN();
  });

  it('converts an empty lastInspectedAt back to null', () => {
    const input = toAssetInput({ ...toFormValues(asset), lastInspectedAt: '' });
    expect(input.lastInspectedAt).toBeNull();
  });
});

describe('getFieldErrors', () => {
  it('returns no errors for a fully valid, populated form', () => {
    expect(getFieldErrors(toFormValues(asset))).toEqual({});
  });

  it('flags a missing name', () => {
    const errors = getFieldErrors({ ...toFormValues(asset), name: '' });
    expect(errors.name).toBeTruthy();
  });

  it('flags lat and lng when no location has been picked', () => {
    const errors = getFieldErrors({ ...toFormValues(asset), location: null });
    expect(errors.lat).toBeTruthy();
    expect(errors.lng).toBeTruthy();
  });

  it('flags a missing installedAt', () => {
    const errors = getFieldErrors({ ...toFormValues(asset), installedAt: '' });
    expect(errors.installedAt).toBeTruthy();
  });
});
