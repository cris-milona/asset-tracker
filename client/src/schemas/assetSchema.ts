import { z } from 'zod';
import { assetStatuses, assetTypes } from '../types';

export const assetInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  type: z.enum(assetTypes),
  status: z.enum(assetStatuses),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  installedAt: z.string().date('Installed at is required'),
  lastInspectedAt: z.string().date().nullable(),
  notes: z.string(),
});

export type AssetFormFieldErrors = Partial<Record<keyof z.infer<typeof assetInputSchema>, string>>;
