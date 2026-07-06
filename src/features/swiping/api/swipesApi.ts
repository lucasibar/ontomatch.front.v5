import { baseApi } from '../../../shared/api/baseApi';
import { type Profile } from '../types';

export const swipesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFeed: builder.query<Profile[], { excludeInactive?: boolean, minAge?: number, maxAge?: number, genders?: string[], gendersCustom?: string[], distanceKm?: number } | void>({
            query: (params) => {
                if (!params) return { url: '/discovery/feed' };
                const queryParams: any = { ...params };
                if (Array.isArray(params.genders)) {
                    queryParams.genders = params.genders.join(',');
                }
                if (Array.isArray(params.gendersCustom)) {
                    queryParams.gendersCustom = params.gendersCustom.join(',');
                }
                return {
                    url: '/discovery/feed',
                    params: queryParams,
                };
            },
            providesTags: ['Profile'],
            transformResponse: (response: { data: Profile[], meta: any }) => response.data,
        }),
        postSwipe: builder.mutation<{ matched: boolean, matchId?: string, conversationId?: string }, { targetUserId: string, action: 'LIKE' | 'PASS' }>({
            query: ({ targetUserId, action }) => ({
                url: '/swipes',
                method: 'POST',
                body: { targetUserId, action },
            }),
        }),
    }),
});

export const { useGetFeedQuery, usePostSwipeMutation } = swipesApi;
