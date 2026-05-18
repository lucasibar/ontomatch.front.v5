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
        forgotPassword: builder.mutation<{ message: string }, string>({
            query: (email) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: { email },
            }),
        }),
        resetPassword: builder.mutation<{ message: string }, any>({
            query: (data) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const { 
    useLoginMutation, 
    useRegisterMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation
} = authApi;
