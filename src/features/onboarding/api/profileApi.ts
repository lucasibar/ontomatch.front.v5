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
        getPreferences: builder.query({
            query: () => '/preferences/me',
            providesTags: ['User'],
        }),
        updatePreferences: builder.mutation({
            query: (body: any) => ({
                url: '/preferences/me',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        deletePhoto: builder.mutation({
            query: (photoId: string) => ({
                url: `/profiles/photos/${photoId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
        reorderPhotos: builder.mutation({
            query: (photoIds: string[]) => ({
                url: '/profiles/photos/reorder',
                method: 'POST',
                body: { photoIds },
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
    useGetPreferencesQuery,
    useUpdateProfileMutation,
    useAddPhotoMutation,
    useUpdatePreferencesMutation,
    useDeletePhotoMutation,
    useReorderPhotosMutation,
    useGetSignatureQuery,
    useLazyGetSignatureQuery,
    useSearchLocationsQuery,
    useLazySearchLocationsQuery
} = profileApi;
