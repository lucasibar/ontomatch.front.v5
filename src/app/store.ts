import { configureStore, isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../shared/api/baseApi';
import { matchesApi } from '../features/matches/api/matchesApi';
import authReducer, { logout } from '../features/auth/model/authSlice';
import chatReducer from '../features/chat/model/chatSlice';

export const rtkQueryErrorLogger: Middleware = (api) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        if ((action.payload as any)?.status === 401) {
            api.dispatch(logout());
        }
    }
    return next(action);
};

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        [matchesApi.reducerPath]: matchesApi.reducer,
        auth: authReducer,
        chat: chatReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware, matchesApi.middleware, rtkQueryErrorLogger),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
