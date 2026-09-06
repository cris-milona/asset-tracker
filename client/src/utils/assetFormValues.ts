import { assetInputSchema, type AssetFormFieldErrors } from '../schemas/assetSchema';
import type { Asset, AssetInput } from '../types';
import type { LatLng } from '../components/LocationPickerMap';

export type FormValues = {
  name: string;
  type: Asset['type'];
  status: Asset['status'];
  location: LatLng | null;
  installedAt: string;
  lastInspectedAt: string;
  notes: string;
};

export const emptyValues: FormValues = {
  name: '',
  type: 'sensor',
  status: 'ok',
  location: null,
  installedAt: '',
  lastInspectedAt: '',
  notes: '',
};

export const toFormValues = (asset: Asset): FormValues => ({
  name: asset.name,
  type: asset.type,
  status: asset.status,
  location: { lat: asset.lat, lng: asset.lng },
  installedAt: asset.installedAt,
  lastInspectedAt: asset.lastInspectedAt ?? '',
  notes: asset.notes,
});

export const toAssetInput = (values: FormValues): AssetInput => {
  if (!values.location) {
    throw new Error('toAssetInput called without a selected location');
  }
  return {
    name: values.name.trim(),
    type: values.type,
    status: values.status,
    lat: values.location.lat,
    lng: values.location.lng,
    installedAt: values.installedAt,
    lastInspectedAt: values.lastInspectedAt || null,
    notes: values.notes,
  };
};

const nonLocationSchema = assetInputSchema.omit({ lat: true, lng: true });

export const getFieldErrors = (values: FormValues): AssetFormFieldErrors => {
  const result = nonLocationSchema.safeParse({
    name: values.name.trim(),
    type: values.type,
    status: values.status,
    installedAt: values.installedAt,
    lastInspectedAt: values.lastInspectedAt || null,
    notes: values.notes,
  });

  const fieldErrors: AssetFormFieldErrors = result.success
    ? {}
    : (Object.fromEntries(
        Object.entries(result.error.flatten().fieldErrors)
          .filter(([, messages]) => messages && messages.length > 0)
          .map(([field, messages]) => [field, messages![0]]),
      ) as AssetFormFieldErrors);

  if (!values.location) {
    fieldErrors.lat = 'Select a location on the map';
    fieldErrors.lng = 'Select a location on the map';
  }

  return fieldErrors;
};
