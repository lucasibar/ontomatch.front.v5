import { baseApi } from '../../../shared/api/baseApi';


// Redefine if we can't import comfortably across monorepo without strict setup
export enum SwipeActionEnum {
    LIKE = 'LIKE',
    PASS = 'PASS',
}

export const discoveryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFeed: builder.query<any[], void>({ // Replace any with Profile type
            query: () => '/discovery/feed',
            providesTags: ['Profile'],
        }),
        swipe: builder.mutation<{ matched: boolean; matchId?: string }, { targetUserId: string; action: SwipeActionEnum }>({
            query: (body) => ({
                url: '/swipes',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Profile', 'Match'], // Refetch feed/matches
        }),
    }),
});

export const { useGetFeedQuery, useSwipeMutation } = discoveryApi;
