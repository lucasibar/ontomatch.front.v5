import { baseApi } from '../../../shared/api/baseApi';

// Types
export interface Message {
    id: string;
    senderUserId: string;
    body: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    partner: {
        id: string;
        name: string;
        photoUrl: string | null;
    };
    lastMessage: {
        body: string;
        createdAt: string;
        senderId: string;
    } | null;
    updatedAt: string;
}

export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query<Conversation[], void>({
            query: () => '/conversations',
            providesTags: ['Conversation'],
        }),
        getSupportConversations: builder.query<Conversation[], void>({
            query: () => '/conversations/support',
            providesTags: ['Conversation'],
        }),
        getMessages: builder.query<Message[], { conversationId: string }>({
            query: ({ conversationId }) => `/conversations/${conversationId}/messages`,
            providesTags: (_result, _error, arg) => [{ type: 'Conversation', id: arg.conversationId }],
        }),
        sendMessage: builder.mutation<void, { conversationId: string; body: string }>({
            queryFn: () => ({ data: undefined }),
        }),
        blockUser: builder.mutation<void, { blockedId: string }>({
            query: (body) => ({
                url: '/blocks',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Conversation'],
        }),
        reportUser: builder.mutation<void, { reportedId: string; reason: string }>({
            query: (body) => ({
                url: '/reports',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Conversation'],
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useGetSupportConversationsQuery,
    useGetMessagesQuery,
    useBlockUserMutation,
    useReportUserMutation,
} = chatApi;
