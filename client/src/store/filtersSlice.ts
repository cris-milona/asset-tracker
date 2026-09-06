import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AssetStatus, AssetType, BoundingBox } from '../types';

export type FiltersState = {
  types: AssetType[];
  statuses: AssetStatus[];
  mapBounds: BoundingBox | null;
};

const initialState: FiltersState = {
  types: [],
  statuses: [],
  mapBounds: null,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    typesChanged(state, action: PayloadAction<AssetType[]>) {
      state.types = action.payload;
    },
    statusesChanged(state, action: PayloadAction<AssetStatus[]>) {
      state.statuses = action.payload;
    },
    mapBoundsChanged(state, action: PayloadAction<BoundingBox>) {
      state.mapBounds = action.payload;
    },
  },
});

export const { typesChanged, statusesChanged, mapBoundsChanged } = filtersSlice.actions;
export const filtersReducer = filtersSlice.reducer;
