import { useEffect } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { Asset } from '../types';
import { statusHexColor } from '../statusColor';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../mapDefaults';
import { useAppDispatch } from '../store/hooks';
import { mapBoundsChanged } from '../store/filtersSlice';

export type AssetMapProps = {
  assets: Asset[];
  total: number;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (asset: Asset) => void;
};

// Reads the current rectangle of the map so the backend's WHERE clause only returns assets actually visible on the map.
const BoundsReporter = () => {
  const dispatch = useAppDispatch();

  const reportBounds = (map: ReturnType<typeof useMap>) => {
    //we get the visible area by leaflets
    const bounds = map.getBounds();
    dispatch(
      mapBoundsChanged({
        minLng: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLng: bounds.getEast(),
        maxLat: bounds.getNorth(),
      }),
    );
  };

  const map = useMapEvents({
    //every time we move something it recalculates the rectangle
    moveend: () => reportBounds(map),
  });

  useEffect(() => {
    reportBounds(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
};

const AssetMap = ({ assets, total, onEditAsset, onDeleteAsset }: AssetMapProps) => (
  <Box>
    {assets.length < total && (
      <Alert severity="warning" sx={{ mb: 1 }}>
        Showing {assets.length} of {total} assets in this area — zoom in to see the rest.
      </Alert>
    )}
    <Box sx={{ height: 600, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsReporter />
        {assets.map((asset) => (
          <CircleMarker
            key={asset.id}
            center={[asset.lat, asset.lng]}
            radius={8}
            pathOptions={{ color: statusHexColor[asset.status] }}
          >
            <Popup>
              <Stack spacing={0.5} sx={{ minWidth: 160 }}>
                <Typography variant="subtitle2">{asset.name}</Typography>
                <Typography variant="body2">
                  {asset.type} &middot; {asset.status}
                </Typography>
                <Typography variant="body2">Installed: {asset.installedAt}</Typography>
                {asset.lastInspectedAt && (
                  <Typography variant="body2">Last inspected: {asset.lastInspectedAt}</Typography>
                )}
                {asset.notes && <Typography variant="body2">{asset.notes}</Typography>}
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" onClick={() => onEditAsset(asset)}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => onDeleteAsset(asset)}>
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </Box>
  </Box>
);

export default AssetMap;
