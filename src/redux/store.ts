import { configureStore } from '@reduxjs/toolkit';
import { api } from './services/tasks';
import { slice } from './slice';

const store = configureStore({
    reducer: { 
        slice: slice.reducer,
        [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;