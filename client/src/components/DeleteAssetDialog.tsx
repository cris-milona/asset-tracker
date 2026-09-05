import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useDeleteAssetMutation } from '../store/assetsApi';
import type { Asset } from '../types';

export type DeleteAssetDialogProps = {
  asset: Asset | null;
  onClose: () => void;
};

const DeleteAssetDialog = ({ asset, onClose }: DeleteAssetDialogProps) => {
  const [deleteAsset, { isLoading, error }] = useDeleteAssetMutation();

  const handleConfirm = async () => {
    if (!asset) return;
    await deleteAsset(asset.id).unwrap();
    onClose();
  };

  return (
    <Dialog open={asset !== null} onClose={onClose}>
      <DialogTitle>Delete asset</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">Failed to delete asset.</Alert>}
        Are you sure you want to delete "{asset?.name}"? This cannot be undone.
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => void handleConfirm()}
          color="error"
          variant="contained"
          disabled={isLoading}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAssetDialog;
