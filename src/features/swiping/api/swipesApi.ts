
import { baseApi } from '../../../shared/api/baseApi';
import { Profile } from '../types';

export const swipesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFeed: builder.query<Profile[], { excludeInactive?: boolean, minAge?: number, maxAge?: number, genders?: string[] } | void>({
            query: (params) => ({
                url: '/discovery/feed',
                params: params || {},
            }),
            providesTags: ['Profile'],
            // Transform response if necessary (e.g. backend returns raw array)
        }),
        postSwipe: builder.mutation<{ matched: boolean, matchId?: string }, { targetUserId: string, action: 'LIKE' | 'PASS' }>({
            query: ({ targetUserId, action }) => ({
                url: '/swipes',
                method: 'POST',
                body: { targetUserId, action },
            }),
            // Don't invalidate 'Profile' to avoid refetching the whole feed immediately?
            // Usually we just remove the card locally.
        }),
    }),
});

export const { useGetFeedQuery, usePostSwipeMutation } = swipesApi;
