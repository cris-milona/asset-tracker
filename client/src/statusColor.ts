import type { AssetStatus } from './types';

export const statusColor: Record<AssetStatus, 'success' | 'warning' | 'error'> = {
  ok: 'success',
  warning: 'warning',
  critical: 'error',
};

// MUI's palette names ('success'/'warning'/'error') aren't valid CSS colors, so map markers (plain CSS) need their own hex values, matching MUI's default palette.
export const statusHexColor: Record<AssetStatus, string> = {
  ok: '#2e7d32',
  warning: '#ed6c02',
  critical: '#d32f2f',
};
