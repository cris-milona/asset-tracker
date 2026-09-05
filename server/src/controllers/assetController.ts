import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import {
  createAsset,
  deleteAsset,
  getAsset,
  listAssets,
  updateAsset,
} from '../services/assetStore.js';
import { assetStatuses, assetTypes } from '../types.js';

export const assetInputSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(['sensor', 'pipe', 'valve', 'hydrant']),
  status: z.enum(['ok', 'warning', 'critical']),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  installedAt: z.string().date(),
  lastInspectedAt: z.string().date().nullable(),
  notes: z.string(),
});

const idSchema = z.string().uuid();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(40).default(10),
});

// ?bbox=minLng,minLat,maxLng,maxLat, matching the current map viewport.
const bboxSchema = z
  .string()
  .transform((value) => value.split(',').map(Number))
  .pipe(z.tuple([z.number(), z.number(), z.number(), z.number()]))
  .transform(([minLng, minLat, maxLng, maxLat]) => ({ minLng, minLat, maxLng, maxLat }))
  .refine(
    (bbox) => bbox.minLng <= bbox.maxLng && bbox.minLat <= bbox.maxLat,
    'bbox must be minLng,minLat,maxLng,maxLat with min <= max',
  );

export const listQuerySchema = paginationSchema.extend({
  types: z.array(z.enum(assetTypes)).optional(),
  statuses: z.array(z.enum(assetStatuses)).optional(),
  bbox: bboxSchema.optional(),
});

//turns a query parameter into an array of strings, or undefined if that parameter wasn't provided at all
export const parseQueryValues = (value: unknown): string[] | undefined => {
  if (value === undefined) return undefined;
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((item) => String(item).split(',')).filter(Boolean);
};

const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };

export const listAssetsHandler: RequestHandler = asyncHandler(async (request, response) => {
  const query = listQuerySchema.parse({
    ...request.query,
    types: parseQueryValues(request.query.type),
    statuses: parseQueryValues(request.query.status),
  });
  const result = await listAssets({
    page: query.page,
    limit: query.limit,
    types: query.types,
    statuses: query.statuses,
    bbox: query.bbox,
  });
  response.json({
    data: result.assets,
    page: query.page,
    limit: query.limit,
    total: result.total,
  });
});

export const getAssetHandler: RequestHandler = asyncHandler(async (request, response) => {
  const asset = await getAsset(idSchema.parse(request.params.id));
  if (!asset) throw new HttpError(404, 'Asset not found', 'NOT_FOUND');
  response.json({ data: asset });
});

export const createAssetHandler: RequestHandler = asyncHandler(async (request, response) => {
  const input = assetInputSchema.parse(request.body);
  const asset = await createAsset(randomUUID(), input);
  response.status(201).json({ data: asset });
});

export const updateAssetHandler: RequestHandler = asyncHandler(async (request, response) => {
  const input = assetInputSchema.partial().parse(request.body);
  const asset = await updateAsset(idSchema.parse(request.params.id), input);
  if (!asset) throw new HttpError(404, 'Asset not found', 'NOT_FOUND');
  response.json({ data: asset });
});

export const deleteAssetHandler: RequestHandler = asyncHandler(async (request, response) => {
  const deleted = await deleteAsset(idSchema.parse(request.params.id));
  if (!deleted) throw new HttpError(404, 'Asset not found', 'NOT_FOUND');
  response.status(204).send();
});
