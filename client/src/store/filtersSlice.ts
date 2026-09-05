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
// /Redux Toolkit's main tool for defining a slice of state, combines the old action, initial state and reducer of redux
const filtersSlice = createSlice({
  //by convention, the slice's name is matching the key of the reducer's object in the store
  name: 'filters',
  initialState,
  //Each function you write here becomes two things at once: a piece of the reducer logic (how state changes), and an auto-generated action creator with the same name.
  reducers: {
    typesChanged(state, action: PayloadAction<AssetType[]>) {
      //Whatever comes in as action.payload becomes the new value of state.types, full stop — even if it happens to be identical to what was already there
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
//Redux Toolkit auto-generated object, containing the action creators matching your reducers functions
export const { typesChanged, statusesChanged, mapBoundsChanged } = filtersSlice.actions;
export const filtersReducer = filtersSlice.reducer;
