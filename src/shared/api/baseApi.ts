import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            // Get token from cookie or local storage if we decided to use it (cookie is HttpOnly so we rely on browser)
            // If we used localStorage for access token:
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User', 'Profile', 'Swipe', 'Match', 'Conversation'],
    endpoints: () => ({}),
});
