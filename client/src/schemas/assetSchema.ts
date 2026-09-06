import { z } from 'zod';
import { assetStatuses, assetTypes } from '../types';

// Mirrors server/src/controllers/assetController.ts's assetInputSchema (not shared
// across the client/server boundary — keep the two in sync by hand when changing
// either). This copy adds custom error messages for form field display.
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
