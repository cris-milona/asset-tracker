import { useEffect, useState } from 'react';
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

type FormValues = {
  name: string;
  type: Asset['type'];
  status: Asset['status'];
  lat: string;
  lng: string;
  installedAt: string;
  lastInspectedAt: string;
  notes: string;
};

const emptyValues: FormValues = {
  name: '',
  type: 'sensor',
  status: 'ok',
  lat: '',
  lng: '',
  installedAt: '',
  lastInspectedAt: '',
  notes: '',
};

const toFormValues = (asset: Asset): FormValues => ({
  name: asset.name,
  type: asset.type,
  status: asset.status,
  lat: String(asset.lat),
  lng: String(asset.lng),
  installedAt: asset.installedAt,
  lastInspectedAt: asset.lastInspectedAt ?? '',
  notes: asset.notes,
});

const toAssetInput = (values: FormValues): AssetInput => ({
  name: values.name.trim(),
  type: values.type,
  status: values.status,
  lat: values.lat.trim() === '' ? NaN : Number(values.lat),
  lng: values.lng.trim() === '' ? NaN : Number(values.lng),
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

export type AssetFormDialogProps = {
  open: boolean;
  onClose: () => void;
  asset?: Asset;
};

const AssetFormDialog = ({ open, onClose, asset }: AssetFormDialogProps) => {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [createAsset, createState] = useCreateAssetMutation();
  const [updateAsset, updateState] = useUpdateAssetMutation();

  useEffect(() => {
    if (open) {
      setValues(asset ? toFormValues(asset) : emptyValues);
      setHasAttemptedSubmit(false);
    }
  }, [open, asset]);

  const isSaving = createState.isLoading || updateState.isLoading;
  const error = createState.error ?? updateState.error;
  const fieldErrors = getFieldErrors(values);
  const isValid = Object.keys(fieldErrors).length === 0;

  const handleChange =
    (field: keyof FormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{asset ? 'Edit asset' : 'New asset'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">Failed to save asset.</Alert>}
          <TextField
            label="Name"
            value={values.name}
            onChange={handleChange('name')}
            required
            fullWidth
            error={hasAttemptedSubmit && Boolean(fieldErrors.name)}
            helperText={hasAttemptedSubmit ? fieldErrors.name : undefined}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Type"
              value={values.type}
              onChange={handleChange('type')}
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
              onChange={handleChange('status')}
              fullWidth
            >
              {assetStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Latitude"
              type="number"
              value={values.lat}
              onChange={handleChange('lat')}
              required
              fullWidth
              error={hasAttemptedSubmit && Boolean(fieldErrors.lat)}
              helperText={hasAttemptedSubmit ? fieldErrors.lat : undefined}
              slotProps={{ htmlInput: { min: -90, max: 90, step: 'any' } }}
            />
            <TextField
              label="Longitude"
              type="number"
              value={values.lng}
              onChange={handleChange('lng')}
              required
              fullWidth
              error={hasAttemptedSubmit && Boolean(fieldErrors.lng)}
              helperText={hasAttemptedSubmit ? fieldErrors.lng : undefined}
              slotProps={{ htmlInput: { min: -180, max: 180, step: 'any' } }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Installed at"
              type="date"
              value={values.installedAt}
              onChange={handleChange('installedAt')}
              required
              fullWidth
              error={hasAttemptedSubmit && Boolean(fieldErrors.installedAt)}
              helperText={hasAttemptedSubmit ? fieldErrors.installedAt : undefined}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Last inspected at"
              type="date"
              value={values.lastInspectedAt}
              onChange={handleChange('lastInspectedAt')}
              fullWidth
              error={hasAttemptedSubmit && Boolean(fieldErrors.lastInspectedAt)}
              helperText={hasAttemptedSubmit ? fieldErrors.lastInspectedAt : undefined}
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
    </Dialog>
  );
};

export default AssetFormDialog;
