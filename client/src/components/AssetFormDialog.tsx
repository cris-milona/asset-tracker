import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useCreateAssetMutation, useUpdateAssetMutation } from '../store/assetsApi';
import { assetInputSchema, type AssetFormFieldErrors } from '../schemas/assetSchema';
import { assetStatuses, assetTypes, type Asset, type AssetInput } from '../types';
import ValidatedTextField from './ValidatedTextField';
import LocationPickerMap, { type LatLng } from './LocationPickerMap';

type FormValues = {
  name: string;
  type: Asset['type'];
  status: Asset['status'];
  location: LatLng | null;
  installedAt: string;
  lastInspectedAt: string;
  notes: string;
};

type TextFieldKey = 'name' | 'installedAt' | 'lastInspectedAt' | 'notes';

const emptyValues: FormValues = {
  name: '',
  type: 'sensor',
  status: 'ok',
  location: null,
  installedAt: '',
  lastInspectedAt: '',
  notes: '',
};

const toFormValues = (asset: Asset): FormValues => ({
  name: asset.name,
  type: asset.type,
  status: asset.status,
  location: { lat: asset.lat, lng: asset.lng },
  installedAt: asset.installedAt,
  lastInspectedAt: asset.lastInspectedAt ?? '',
  notes: asset.notes,
});

const toAssetInput = (values: FormValues): AssetInput => ({
  name: values.name.trim(),
  type: values.type,
  status: values.status,
  lat: values.location ? values.location.lat : NaN,
  lng: values.location ? values.location.lng : NaN,
  installedAt: values.installedAt,
  lastInspectedAt: values.lastInspectedAt || null,
  notes: values.notes,
});

const getFieldErrors = (values: FormValues): AssetFormFieldErrors => {
  const result = assetInputSchema.safeParse(toAssetInput(values));
  if (result.success) return {};
  const fieldErrors = result.error.flatten().fieldErrors;
  return Object.fromEntries(
    Object.entries(fieldErrors)
      .filter(([, messages]) => messages && messages.length > 0)
      .map(([field, messages]) => [field, messages![0]]),
  ) as AssetFormFieldErrors;
};

type AssetFormContentProps = {
  onClose: () => void;
  asset?: Asset;
};

const AssetFormContent = ({ onClose, asset }: AssetFormContentProps) => {
  const [values, setValues] = useState<FormValues>(() =>
    asset ? toFormValues(asset) : emptyValues,
  );
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [createAsset, createState] = useCreateAssetMutation();
  const [updateAsset, updateState] = useUpdateAssetMutation();

  const isSaving = createState.isLoading || updateState.isLoading;
  const error = createState.error ?? updateState.error;
  const fieldErrors = getFieldErrors(values);
  const isValid = Object.keys(fieldErrors).length === 0;

  const handleChange = (field: TextFieldKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleLocationChange = (location: LatLng) => {
    setValues((prev) => ({ ...prev, location }));
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    if (!isValid) return;

    const input = toAssetInput(values);
    if (asset) {
      await updateAsset({ id: asset.id, body: input }).unwrap();
    } else {
      await createAsset(input).unwrap();
    }
    onClose();
  };

  return (
    <>
      <DialogTitle>{asset ? 'Edit asset' : 'New asset'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">Failed to save asset.</Alert>}
          <ValidatedTextField
            label="Name"
            value={values.name}
            onChange={handleChange('name')}
            required
            fullWidth
            fieldError={fieldErrors.name}
            hasAttemptedSubmit={hasAttemptedSubmit}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Type"
              value={values.type}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, type: event.target.value as Asset['type'] }))
              }
              fullWidth
            >
              {assetTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              value={values.status}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, status: event.target.value as Asset['status'] }))
              }
              fullWidth
            >
              {assetStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <LocationPickerMap
            value={values.location}
            mode={asset ? 'edit' : 'create'}
            onChange={handleLocationChange}
          />
          {hasAttemptedSubmit && (fieldErrors.lat || fieldErrors.lng) && (
            <Alert severity="error">Select a location on the map.</Alert>
          )}
          <Stack direction="row" spacing={2}>
            <ValidatedTextField
              label="Installed at"
              type="date"
              value={values.installedAt}
              onChange={handleChange('installedAt')}
              required
              fullWidth
              fieldError={fieldErrors.installedAt}
              hasAttemptedSubmit={hasAttemptedSubmit}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <ValidatedTextField
              label="Last inspected at"
              type="date"
              value={values.lastInspectedAt}
              onChange={handleChange('lastInspectedAt')}
              fullWidth
              fieldError={fieldErrors.lastInspectedAt}
              hasAttemptedSubmit={hasAttemptedSubmit}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <TextField
            label="Notes"
            value={values.notes}
            onChange={handleChange('notes')}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => void handleSubmit()}
          variant="contained"
          disabled={(hasAttemptedSubmit && !isValid) || isSaving}
        >
          Save
        </Button>
      </DialogActions>
    </>
  );
};

export type AssetFormDialogProps = {
  open: boolean;
  onClose: () => void;
  asset?: Asset;
};

const AssetFormDialog = ({ open, onClose, asset }: AssetFormDialogProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <AssetFormContent key={`${open}-${asset?.id ?? 'new'}`} asset={asset} onClose={onClose} />
  </Dialog>
);

export default AssetFormDialog;
