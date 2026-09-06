import { useState } from 'react';
import { Container, Stack, Typography } from '@mui/material';
import AssetList from '../components/AssetList';
import AssetMap from '../components/AssetMap';
import AssetFormDialog from '../components/AssetFormDialog';
import DeleteAssetDialog from '../components/DeleteAssetDialog';
import { useAppSelector } from '../store/hooks';
import { useListAssetsQuery } from '../store/assetsApi';
import type { Asset } from '../types';

// The API's max page size — a safety cap for how many markers render at once, not a real-world limit: the bbox filter already restricts results to the current viewport.
const MAP_ASSET_LIMIT = 40;

const AssetsPage = () => {
  const types = useAppSelector((state) => state.filters.types);
  const statuses = useAppSelector((state) => state.filters.statuses);
  const mapBounds = useAppSelector((state) => state.filters.mapBounds);
  const [formAsset, setFormAsset] = useState<Asset | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  const { data: mapData } = useListAssetsQuery({
    page: 1,
    limit: MAP_ASSET_LIMIT,
    types,
    statuses,
    bbox: mapBounds,
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
          />
        </Stack>
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <AssetMap
            assets={mapData?.data ?? []}
            totalInView={mapData?.total ?? 0}
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
