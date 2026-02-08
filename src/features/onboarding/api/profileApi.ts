import { baseApi } from '../../../shared/api/baseApi';

export const profileApi = baseApi.injectEndpoints({
    endpoints: (builder: any) => ({
        getMe: builder.query({
            query: () => '/profiles/me',
            providesTags: ['User'],
        }),
        updateProfile: builder.mutation({
            query: (body: any) => ({
                url: '/profiles/me',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        addPhoto: builder.mutation({
            query: (body: any) => ({
                url: '/profiles/photos',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        updatePreferences: builder.mutation({
            query: (body: any) => ({
                url: '/preferences/me',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        getSignature: builder.query({
            query: () => '/media/signature',
        }),
        searchLocations: builder.query({
            query: (q: string) => `/locations?q=${q}`,
        }),
    }),
});

export const {
    useGetMeQuery,
    useUpdateProfileMutation,
    useAddPhotoMutation,
    useUpdatePreferencesMutation,
    useGetSignatureQuery,
    useLazyGetSignatureQuery,
    useSearchLocationsQuery,
    useLazySearchLocationsQuery
} = profileApi;
