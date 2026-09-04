import { Router } from 'express';
import {
  createAssetHandler,
  deleteAssetHandler,
  getAssetHandler,
  listAssetsHandler,
  updateAssetHandler,
} from '../controllers/assetController.js';

export const assetRoutes = Router();

assetRoutes.get('/', listAssetsHandler);
assetRoutes.get('/:id', getAssetHandler);
assetRoutes.post('/', createAssetHandler);
assetRoutes.patch('/:id', updateAssetHandler);
assetRoutes.delete('/:id', deleteAssetHandler);
