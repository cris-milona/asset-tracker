import { configureStore } from '@reduxjs/toolkit';
import { assetsApi } from './assetsApi';
import { filtersReducer } from './filtersSlice';

//Redux Toolkit's function for creating your store
export const store = configureStore({
  reducer: {
    //this is your own slice, the one holding UI state like selected type/status filters, state.filters
    filters: filtersReducer,
    //RTK Query's slice, is a reducer function that createApi generated automatically — it's what manages all the cache data, loading flags, and everything else RTK Query needs internally. the brakets help to always take the name we give in assetApi   reducerPath: 'assetsApi',
    [assetsApi.reducerPath]: assetsApi.reducer,
  },
  //Redux Toolkit's getDefaultMiddleware() gives you a sensible default set of middleware it thinks every app should have (things like development-mode checks that warn you if you accidentally mutate state incorrectly)
  //concat: start with Redux Toolkit's normal default middleware, and add RTK Query's middleware on top.
  //RTK Query's middleware makes caching, automatic refetching, cache invalidation, and request deduplication work.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(assetsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
