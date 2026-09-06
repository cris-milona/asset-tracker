import { useEffect, useState } from 'react';
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

const isValidLat = (lat: number) => Number.isFinite(lat) && lat >= -90 && lat <= 90;
const isValidLng = (lng: number) => Number.isFinite(lng) && lng >= -180 && lng <= 180;

const LocationPickerMap = ({ value, mode, onChange }: LocationPickerMapProps) => {
  const [latText, setLatText] = useState(value ? String(value.lat) : '');
  const [lngText, setLngText] = useState(value ? String(value.lng) : '');

  // Only overwrite the typed text when the value changed from outside this component
  // (a map click or marker drag) — comparing against the locally parsed number lets an
  // in-progress edit like "12.50" survive being re-rendered as "12.5" mid-keystroke.
  useEffect(() => {
    if (!value) {
      setLatText('');
      setLngText('');
      return;
    }
    if (Number(latText) !== value.lat || Number(lngText) !== value.lng) {
      setLatText(String(value.lat));
      setLngText(String(value.lng));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commitIfValid = (nextLatText: string, nextLngText: string) => {
    const lat = Number(nextLatText);
    const lng = Number(nextLngText);
    if (nextLatText !== '' && nextLngText !== '' && isValidLat(lat) && isValidLng(lng)) {
      onChange({ lat, lng });
    }
  };

  const handleLatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLatText(event.target.value);
    commitIfValid(event.target.value, lngText);
  };

  const handleLngChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLngText(event.target.value);
    commitIfValid(latText, event.target.value);
  };

  const latError = latText !== '' && !isValidLat(Number(latText));
  const lngError = lngText !== '' && !isValidLng(Number(lngText));

  return (
    <Box>
      <Typography
        variant="body2"
        color={mode === 'create' ? 'text.secondary' : 'text.primary'}
        fontWeight={mode === 'edit' ? 'bold' : undefined}
        gutterBottom
      >
        {mode === 'create'
          ? "Click the map, or type coordinates below, to set this asset's location"
          : 'Drag the marker, or type coordinates below, to relocate it'}
      </Typography>
      <Box sx={{ height: 250, borderRadius: 1, overflow: 'hidden' }}>
        <MapContainer
          center={value ? [value.lat, value.lng] : DEFAULT_MAP_CENTER}
          zoom={value ? 12 : DEFAULT_MAP_ZOOM}
          style={{ height: '100%', width: '100%' }}
        >
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
        <TextField
          label="Latitude"
          type="number"
          value={latText}
          onChange={handleLatChange}
          error={latError}
          helperText={latError ? 'Must be between -90 and 90' : undefined}
          fullWidth
          slotProps={{ htmlInput: { min: -90, max: 90, step: 'any' } }}
        />
        <TextField
          label="Longitude"
          type="number"
          value={lngText}
          onChange={handleLngChange}
          error={lngError}
          helperText={lngError ? 'Must be between -180 and 180' : undefined}
          fullWidth
          slotProps={{ htmlInput: { min: -180, max: 180, step: 'any' } }}
        />
      </Stack>
    </Box>
  );
};

export default LocationPickerMap;
