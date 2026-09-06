import { configureStore } from '@reduxjs/toolkit';
import { assetsApi } from './assetsApi';
import { filtersReducer } from './filtersSlice';

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    [assetsApi.reducerPath]: assetsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(assetsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
