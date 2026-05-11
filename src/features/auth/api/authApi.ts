import { baseApi } from '../../../shared/api/baseApi';
import { setCredentials } from '../model/authSlice';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<{ access_token: string; user: any }, any>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials({ user: data.user, token: data.access_token }));
                } catch (err) { }
            },
        }),
        register: builder.mutation<{ access_token: string; user: any }, any>({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials({ user: data.user, token: data.access_token }));
                } catch (err) { }
            },
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
