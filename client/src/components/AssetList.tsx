import { useState } from 'react';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  type SelectChangeEvent,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { statusesChanged, typesChanged } from '../store/filtersSlice';
import { useListAssetsQuery } from '../store/assetsApi';
import { assetStatuses, assetTypes, type Asset, type AssetStatus, type AssetType } from '../types';
import AssetFormDialog from './AssetFormDialog';
import DeleteAssetDialog from './DeleteAssetDialog';
import MultiSelectFilter, { CLEAR_SELECTION } from './MultiSelectFilter';

const statusColor: Record<AssetStatus, 'success' | 'warning' | 'error'> = {
  ok: 'success',
  warning: 'warning',
  critical: 'error',
};

const PAGE_SIZE_OPTIONS = [10, 20, 40] as const;

const AssetList = () => {
  const dispatch = useAppDispatch();
  const types = useAppSelector((state) => state.filters.types);
  //useSelector((state) => state.filters.types), React-Redux checks whether the result of that selector changed compared to the last render, to decide whether the component needs to re-render.
  const statuses = useAppSelector((state) => state.filters.statuses);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [formAsset, setFormAsset] = useState<Asset | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  const { data, isLoading, isError } = useListAssetsQuery({
    page,
    limit,
    types,
    statuses,
  });

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  const handleFilterChange = <T extends string>(
    event: SelectChangeEvent<string[]>,
    actionCreator: ActionCreatorWithPayload<T[]>,
  ) => {
    const value = event.target.value;
    const selected = typeof value === 'string' ? value.split(',') : value;
    dispatch(actionCreator(selected.includes(CLEAR_SELECTION) ? [] : (selected as T[])));
    setPage(1);
  };

  const handleTypesChange = (event: SelectChangeEvent<string[]>) =>
    handleFilterChange<AssetType>(event, typesChanged);

  const handleStatusesChange = (event: SelectChangeEvent<string[]>) =>
    handleFilterChange<AssetStatus>(event, statusesChanged);

  const pageCount = data ? Math.max(1, Math.ceil(data.total / limit)) : 1;

  const openCreateForm = () => {
    setFormAsset(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (asset: Asset) => {
    setFormAsset(asset);
    setIsFormOpen(true);
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={2}>
          <MultiSelectFilter
            value={types}
            options={assetTypes}
            placeholder="All types"
            onChange={handleTypesChange}
          />
          <MultiSelectFilter
            value={statuses}
            options={assetStatuses}
            placeholder="All statuses"
            onChange={handleStatusesChange}
          />
        </Stack>
        <Button variant="contained" onClick={openCreateForm}>
          New asset
        </Button>
      </Stack>

      {isLoading && <CircularProgress />}
      {isError && <Alert severity="error">Failed to load assets.</Alert>}
      {data && data.data.length === 0 && <Alert severity="info">No assets found.</Alert>}

      {data && data.data.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Installed</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.data.map((asset) => (
              <TableRow key={asset.id} hover>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell>
                  <Chip label={asset.status} color={statusColor[asset.status]} size="small" />
                </TableCell>
                <TableCell>{asset.installedAt}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit" size="small" onClick={() => openEditForm(asset)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => setDeleteTarget(asset)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {data && data.data.length > 0 && (
        <Stack direction="row" spacing={2} alignItems="center">
          <Pagination
            page={page}
            count={pageCount}
            onChange={(_event, value) => setPage(value)}
            color="primary"
          />
          <Select value={limit} onChange={handleLimitChange} size="small">
            {PAGE_SIZE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option} / page
              </MenuItem>
            ))}
          </Select>
        </Stack>
      )}

      <AssetFormDialog open={isFormOpen} asset={formAsset} onClose={() => setIsFormOpen(false)} />
      <DeleteAssetDialog asset={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </Stack>
  );
};

export default AssetList;
