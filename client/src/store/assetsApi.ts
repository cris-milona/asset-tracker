import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Asset, AssetInput, AssetListResponse, AssetStatus, AssetType } from '../types';

export type ListAssetsParams = {
  page: number;
  limit: number;
  types: AssetType[];
  statuses: AssetStatus[];
};

const buildListQuery = ({ page, limit, types, statuses }: ListAssetsParams): string => {
  //URLSearchParams is a built-in browser/Node API specifically for building query strings correctly (handling things like encoding special characters) rather than manually concatenating strings like `page=${page}&limit=${limit}` yourself.
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (types.length) params.set('type', types.join(','));
  if (statuses.length) params.set('status', statuses.join(','));
  return params.toString();
};
//the RTK Query definition tying directly into your backend's actual endpoints and response shapes.
export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  //fetchBaseQuery is RTK Query's built-in wrapper around the browser's fetch — it handles the actual HTTP request mechanics (setting baseUrl, headers, parsing JSON) so you don't write raw fetch calls yourself.
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  //this declares which tag names are valid to use elsewhere in this file; a small safety net so a typo'd tag name gets caught by typescript
  tagTypes: ['Asset'],
  endpoints: (builder) => ({
    listAssets: builder.query<AssetListResponse, ListAssetsParams>({
      //for a simple GET, you can just return a URL string directly (rather than an object with url/method/body), since GET is the default method. Here it builds the URL using your buildListQuery helper.
      query: (params) => `/assets?${buildListQuery(params)}`,
      providesTags: ['Asset'],
    }),
    createAsset: builder.mutation<Asset, AssetInput>({
      query: (body) => ({ url: '/assets', method: 'POST', body }),
      //this is the piece that reaches through your API's envelope. Your backend returns { data: { id, name, ... } }, but you don't want every component that uses this hook to have to write result.data.data — awkward and easy to get wrong. transformResponse runs right after the raw HTTP response comes back, and lets you reshape it before RTK Query hands it to your components.
      transformResponse: (response: { data: Asset }) => response.data,
      //this is what triggers listAssets (which providesTags: ['Asset']) to automatically refetch
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
// /pulling the auto-generated hooks out by name (use + endpoint name + Query/Mutation
export const {
  useListAssetsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} = assetsApi;
