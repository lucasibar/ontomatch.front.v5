import { baseApi } from '../../shared/api/baseApi';

export const profileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query<any, void>({
            query: () => '/profiles/me',
            providesTags: ['User'],
        }),
        updateProfile: builder.mutation<any, any>({
            query: (body) => ({
                url: '/profiles/me',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        addPhoto: builder.mutation<void, { url: string; publicId: string }>({
            query: (body) => ({
                url: '/profiles/photos',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        getSignature: builder.query<{ signature: string; timestamp: number; apiKey: string; cloudName: string }, void>({
            query: () => '/media/signature',
        }),
        searchLocations: builder.query<any[], string>({
            query: (q) => `/locations?q=${q}`,
        }),
    }),
});

export const {
    useGetMeQuery,
    useUpdateProfileMutation,
    useAddPhotoMutation,
    useGetSignatureQuery,
    useLazyGetSignatureQuery,
    useSearchLocationsQuery,
    useLazySearchLocationsQuery
} = profileApi;
