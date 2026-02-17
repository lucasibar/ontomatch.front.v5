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
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    profileApi.util.updateQueryData('getMe', undefined, (draft) => {
                        Object.assign(draft, args);
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
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
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    profileApi.util.updateQueryData('getPreferences', undefined, (draft) => {
                        Object.assign(draft, args);
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
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
