import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Asset,
  AssetInput,
  AssetListResponse,
  AssetStatus,
  AssetType,
  BoundingBox,
} from '../types';

export type ListAssetsParams = {
  page: number;
  limit: number;
  types: AssetType[];
  statuses: AssetStatus[];
  bbox?: BoundingBox | null;
};

export const buildListQuery = ({
  page,
  limit,
  types,
  statuses,
  bbox,
}: ListAssetsParams): string => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (types.length) params.set('type', types.join(','));
  if (statuses.length) params.set('status', statuses.join(','));
  if (bbox) {
    params.set('bbox', [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat].join(','));
  }
  return params.toString();
};

export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  tagTypes: ['Asset'],
  endpoints: (builder) => ({
    listAssets: builder.query<AssetListResponse, ListAssetsParams>({
      query: (params) => `/assets?${buildListQuery(params)}`,
      providesTags: ['Asset'],
    }),
    createAsset: builder.mutation<Asset, AssetInput>({
      query: (body) => ({ url: '/assets', method: 'POST', body }),
      transformResponse: (response: { data: Asset }) => response.data,
      invalidatesTags: ['Asset'],
    }),
    updateAsset: builder.mutation<Asset, { id: string; body: Partial<AssetInput> }>({
      query: ({ id, body }) => ({ url: `/assets/${id}`, method: 'PATCH', body }),
      transformResponse: (response: { data: Asset }) => response.data,
      invalidatesTags: ['Asset'],
    }),
    deleteAsset: builder.mutation<void, string>({
      query: (id) => ({ url: `/assets/${id}`, method: 'DELETE', responseHandler: 'text' }),
      invalidatesTags: ['Asset'],
    }),
  }),
});

export const {
  useListAssetsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} = assetsApi;
