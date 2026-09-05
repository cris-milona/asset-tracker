import { useEffect, useRef } from 'react';
import type { CircleMarker as LeafletCircleMarker } from 'leaflet';
import { Box, Button, Stack, Typography } from '@mui/material';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import type { Asset } from '../types';
import { statusHexColor } from '../statusColor';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../mapDefaults';

export type AssetMapProps = {
  assets: Asset[];
  selectedAssetId: string | null;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (asset: Asset) => void;
};

const SELECTED_ZOOM = 14;

type FlyToSelectedProps = {
  asset: Asset | undefined;
  markerRefs: React.RefObject<Map<string, LeafletCircleMarker>>;
};

const FlyToSelected = ({ asset, markerRefs }: FlyToSelectedProps) => {
  const map = useMap();

  useEffect(() => {
    if (!asset) return;
    map.flyTo([asset.lat, asset.lng], SELECTED_ZOOM);
    markerRefs.current.get(asset.id)?.openPopup();
  }, [asset, map, markerRefs]);

  return null;
};

const AssetMap = ({ assets, selectedAssetId, onEditAsset, onDeleteAsset }: AssetMapProps) => {
  const markerRefs = useRef<Map<string, LeafletCircleMarker>>(new Map());
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId);

  return (
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
        {assets.map((asset) => (
          <CircleMarker
            key={asset.id}
            ref={(instance) => {
              if (instance) markerRefs.current.set(asset.id, instance);
              else markerRefs.current.delete(asset.id);
            }}
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
        <FlyToSelected asset={selectedAsset} markerRefs={markerRefs} />
      </MapContainer>
    </Box>
  );
};

export default AssetMap;
