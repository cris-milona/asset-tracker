import { useEffect } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { Asset } from '../types';
import { statusHexColor } from '../statusColor';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../mapDefaults';
import { useAppDispatch } from '../store/hooks';
import { mapBoundsChanged } from '../store/filtersSlice';
import { ASSET_PANEL_HEIGHT, ASSET_PANEL_MIN_HEIGHT } from '../layout';

export type AssetMapProps = {
  assets: Asset[];
  totalInView: number;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (asset: Asset) => void;
};

const BoundsReporter = () => {
  const dispatch = useAppDispatch();

  const reportBounds = (map: ReturnType<typeof useMap>) => {
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
    moveend: () => reportBounds(map),
  });

  useEffect(() => {
    reportBounds(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
};

const AssetMap = ({ assets, totalInView, onEditAsset, onDeleteAsset }: AssetMapProps) => (
  <Box>
    {assets.length < totalInView && (
      <Alert severity="warning" sx={{ mb: 1 }}>
        Showing {assets.length} of {totalInView} assets in this area — zoom in to see the rest.
      </Alert>
    )}
    <Box
      sx={{
        height: ASSET_PANEL_HEIGHT,
        minHeight: ASSET_PANEL_MIN_HEIGHT,
        width: '100%',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
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
