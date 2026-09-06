import { divIcon } from 'leaflet';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { Marker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../mapDefaults';

export type LatLng = { lat: number; lng: number };

export type LocationPickerMode = 'create' | 'edit';

type LocationPickerMapProps = {
  value: LatLng | null;
  mode: LocationPickerMode;
  onChange: (value: LatLng) => void;
};
const markerIcon = divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#1976d2;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.5);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
const ClickHandler = ({ mode, onChange }: Pick<LocationPickerMapProps, 'mode' | 'onChange'>) => {
  useMapEvents({
    click: (event) => {
      if (mode !== 'create') return;
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
};

const LocationPickerMap = ({ value, mode, onChange }: LocationPickerMapProps) => (
  <Box>
    <Typography
      variant="body2"
      color={mode === 'create' ? 'text.secondary' : 'text.primary'}
      fontWeight={mode === 'edit' ? 'bold' : undefined}
      gutterBottom
    >
      {mode === 'create'
        ? "Click the map to set this asset's location"
        : 'Drag the marker to relocate it'}
    </Typography>
    <Box sx={{ height: 250, borderRadius: 1, overflow: 'hidden' }}>
      <MapContainer
        center={value ? [value.lat, value.lng] : DEFAULT_MAP_CENTER}
        zoom={value ? 12 : DEFAULT_MAP_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        OpenStreetMap's servers. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler mode={mode} onChange={onChange} />
        {value && (
          <Marker
            position={[value.lat, value.lng]}
            icon={markerIcon}
            draggable={mode === 'edit'}
            eventHandlers={{
              dragend: (event) => {
                const position = event.target.getLatLng();
                onChange({ lat: position.lat, lng: position.lng });
              },
            }}
          />
        )}
      </MapContainer>
    </Box>
    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
      <TextField label="Latitude" value={value ? value.lat.toFixed(6) : ''} fullWidth disabled />
      <TextField label="Longitude" value={value ? value.lng.toFixed(6) : ''} fullWidth disabled />
    </Stack>
  </Box>
);

export default LocationPickerMap;
