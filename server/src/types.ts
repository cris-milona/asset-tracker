export const assetTypes = ['sensor', 'pipe', 'valve', 'hydrant'] as const;
export const assetStatuses = ['ok', 'warning', 'critical'] as const;

export type AssetType = (typeof assetTypes)[number];
export type AssetStatus = (typeof assetStatuses)[number];

export type Asset = {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  lat: number;
  lng: number;
  installedAt: string;
  lastInspectedAt: string | null;
  notes: string;
};

export type AssetInput = Omit<Asset, 'id'>;

export type AssetPagination = {
  page: number;
  limit: number;
};

export type AssetBoundingBox = {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
};
