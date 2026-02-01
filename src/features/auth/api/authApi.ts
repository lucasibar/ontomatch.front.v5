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
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Decode token or user info if needed, for MVP we assume backend sends user
                    // But our backend login currently only returns access_token. 
                    // We need /auth/me or similar, or decode jwt.
                    // For now, let's assume we decode or backend sends user.
                    // Let's fake user for MVP progress if backend doesn't send it yet.
                    const user = data.user;
                    dispatch(setCredentials({ user, token: data.access_token }));
                } catch (err) { }
            },
        }),
    }),
});

export const { useLoginMutation } = authApi;
