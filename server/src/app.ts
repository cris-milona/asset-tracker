import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { assetRoutes } from './routes/assetRoutes.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/assets', assetRoutes);
app.use(errorHandler);
