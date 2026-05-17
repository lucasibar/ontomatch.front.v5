import { configureStore, isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../shared/api/baseApi';
import { matchesApi } from '../features/matches/api/matchesApi';
import authReducer, { logout } from '../features/auth/model/authSlice';
import chatReducer from '../features/chat/model/chatSlice';
import uiReducer, { showToast } from '../shared/model/uiSlice';

export const rtkQueryErrorLogger: Middleware = (api) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        const payload = action.payload as any;
        if (payload?.status === 401) {
            api.dispatch(logout());
            api.dispatch(showToast({ message: 'Sesión expirada. Por favor, inicia sesión nuevamente.', severity: 'warning' }));
        } else if (payload?.status === 500) {
            api.dispatch(showToast({ message: 'Error interno del servidor. Por favor, intenta más tarde.', severity: 'error' }));
        } else if (payload?.status === 'FETCH_ERROR') {
            api.dispatch(showToast({ message: 'Error de red. Verifica tu conexión a internet.', severity: 'error' }));
        } else if (payload?.data?.message) {
            // Backend validation error or similar
            api.dispatch(showToast({ message: typeof payload.data.message === 'string' ? payload.data.message : 'Ups, algo salió mal.', severity: 'error' }));
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
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware, matchesApi.middleware, rtkQueryErrorLogger),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
