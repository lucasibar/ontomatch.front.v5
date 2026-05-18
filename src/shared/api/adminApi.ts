import { baseApi } from './baseApi';

export interface OverviewMetrics {
    totalUsers: number;
    onboardedProfiles: number;
    totalMatches: number;
    totalMessages: number;
    totalSwipes: number;
    suspendedUsers: number;
}

export interface ActivityMetrics {
    newUsers: number;
    activeUsers: number;
    swipes: number;
    matches: number;
    messages: number;
}

export interface RateMetrics {
    matchRate: string;
    avgMessagesPerMatch: string;
    onboardingCompletion: string;
}

export interface GenderCount {
    gender: string;
    count: number;
}

export interface LocalityCount {
    locality: string;
    count: number;
}

export interface SchoolCount {
    school: string;
    count: number;
}

export interface DemographicsMetrics {
    avgAge: number;
    genders: GenderCount[];
    topLocalities: LocalityCount[];
    topSchools: SchoolCount[];
}

export interface MetricsResponse {
    overview: OverviewMetrics;
    last7days: ActivityMetrics;
    rates: RateMetrics;
    demographics: DemographicsMetrics;
}

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        checkAdmin: builder.query<{ isAdmin: boolean }, void>({
            query: () => '/admin/check',
        }),
        getMetrics: builder.query<MetricsResponse, void>({
            query: () => '/admin/metrics',
        }),
        getAllConversations: builder.query<any[], void>({
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
