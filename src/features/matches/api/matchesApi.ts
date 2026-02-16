
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define minimal state interface to avoid circular dependency with store.ts
interface RootState {
    auth: {
        token: string | null;
    }
}

export interface MatchPartner {
    id: string;
    name: string;
    photoUrl: string | null;
}

export interface Match {
    id: string;
    partner: MatchPartner;
    conversationId: string | null;
    createdAt: string;
}

export const matchesApi = createApi({
    reducerPath: 'matchesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/matches`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Matches'],
    endpoints: (builder) => ({
        getMatches: builder.query<Match[], void>({
            query: () => '',
            providesTags: ['Matches'],
        }),
    }),
});

export const { useGetMatchesQuery } = matchesApi;
