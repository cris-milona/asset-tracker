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

export const toAssetInput = (values: FormValues): AssetInput => ({
  name: values.name.trim(),
  type: values.type,
  status: values.status,
  lat: values.location ? values.location.lat : NaN,
  lng: values.location ? values.location.lng : NaN,
  installedAt: values.installedAt,
  lastInspectedAt: values.lastInspectedAt || null,
  notes: values.notes,
});

export const getFieldErrors = (values: FormValues): AssetFormFieldErrors => {
  const result = assetInputSchema.safeParse(toAssetInput(values));
  if (result.success) return {};
  const fieldErrors = result.error.flatten().fieldErrors;
  return Object.fromEntries(
    Object.entries(fieldErrors)
      .filter(([, messages]) => messages && messages.length > 0)
      .map(([field, messages]) => [field, messages![0]]),
  ) as AssetFormFieldErrors;
};
