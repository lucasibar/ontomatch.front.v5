import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder: any) => ({
        checkAdmin: builder.query({
            query: () => '/admin/check',
        }),
        getMetrics: builder.query({
            query: () => '/admin/metrics',
        }),
        getAllConversations: builder.query({
            query: () => '/admin/conversations',
        }),
    }),
});

export const {
    useCheckAdminQuery,
    useLazyCheckAdminQuery,
    useGetMetricsQuery,
    useLazyGetMetricsQuery,
    useGetAllConversationsQuery,
    useLazyGetAllConversationsQuery,
} = adminApi;
