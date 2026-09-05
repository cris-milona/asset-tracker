import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  ListItemText,
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

const statusColor: Record<AssetStatus, 'success' | 'warning' | 'error'> = {
  ok: 'success',
  warning: 'warning',
  critical: 'error',
};

const CLEAR_SELECTION = '__clear__';
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

  const handleTypesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const selected = typeof value === 'string' ? value.split(',') : value;
    dispatch(typesChanged(selected.includes(CLEAR_SELECTION) ? [] : (selected as AssetType[])));
    setPage(1);
  };

  const handleStatusesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const selected = typeof value === 'string' ? value.split(',') : value;
    dispatch(
      statusesChanged(selected.includes(CLEAR_SELECTION) ? [] : (selected as AssetStatus[])),
    );
    setPage(1);
  };

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
          <Select
            multiple
            displayEmpty
            value={types}
            onChange={handleTypesChange}
            renderValue={(selected) => (selected.length ? selected.join(', ') : 'All types')}
            sx={{
              width: 220,
              '& .MuiSelect-select': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            }}
          >
            <MenuItem value={CLEAR_SELECTION} disabled={types.length === 0}>
              <ListItemText primary="Clear all" />
            </MenuItem>
            <Divider />
            {assetTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          <Select
            multiple
            displayEmpty
            value={statuses}
            onChange={handleStatusesChange}
            renderValue={(selected) => (selected.length ? selected.join(', ') : 'All statuses')}
            sx={{
              width: 220,
              '& .MuiSelect-select': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            }}
          >
            <MenuItem value={CLEAR_SELECTION} disabled={statuses.length === 0}>
              <ListItemText primary="Clear all" />
            </MenuItem>
            <Divider />
            {assetStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
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
