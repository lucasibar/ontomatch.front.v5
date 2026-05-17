
import { baseApi } from '../../../shared/api/baseApi';
import { type Profile } from '../types';

export const swipesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFeed: builder.query<Profile[], { excludeInactive?: boolean, minAge?: number, maxAge?: number, genders?: string[], gendersCustom?: string[], distanceKm?: number } | void>({
            query: (params) => ({
                url: '/discovery/feed',
                params: params || {},
            }),
            providesTags: ['Profile'],
            transformResponse: (response: { data: Profile[], meta: any }) => response.data,
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
