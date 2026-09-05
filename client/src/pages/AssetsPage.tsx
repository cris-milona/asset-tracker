import { useState } from 'react';
import { Container, Stack, Typography } from '@mui/material';
import AssetList from '../components/AssetList';
import AssetMap from '../components/AssetMap';
import AssetFormDialog from '../components/AssetFormDialog';
import DeleteAssetDialog from '../components/DeleteAssetDialog';
import { useAppSelector } from '../store/hooks';
import { useListAssetsQuery } from '../store/assetsApi';
import type { Asset } from '../types';

// The backend has no bounding-box filter yet (that's a later phase), so the map can only
// show up to the API's max page size — not necessarily every asset matching the filters.
const MAP_ASSET_LIMIT = 40;

const AssetsPage = () => {
  const types = useAppSelector((state) => state.filters.types);
  const statuses = useAppSelector((state) => state.filters.statuses);
  const [formAsset, setFormAsset] = useState<Asset | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const { data: mapData } = useListAssetsQuery({
    page: 1,
    limit: MAP_ASSET_LIMIT,
    types,
    statuses,
  });

  const openCreateForm = () => {
    setFormAsset(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (asset: Asset) => {
    setFormAsset(asset);
    setIsFormOpen(true);
  };

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Assets
      </Typography>
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <AssetList
            onNewAsset={openCreateForm}
            onEditAsset={openEditForm}
            onDeleteAsset={setDeleteTarget}
            onSelectAsset={(asset) => setSelectedAssetId(asset.id)}
          />
        </Stack>
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <AssetMap
            assets={mapData?.data ?? []}
            selectedAssetId={selectedAssetId}
            onEditAsset={openEditForm}
            onDeleteAsset={setDeleteTarget}
          />
        </Stack>
      </Stack>

      <AssetFormDialog open={isFormOpen} asset={formAsset} onClose={() => setIsFormOpen(false)} />
      <DeleteAssetDialog asset={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </Container>
  );
};

export default AssetsPage;
