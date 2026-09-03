import { baseApi } from '../../../shared/api/baseApi';

// Types
export interface Message {
    id: string;
    senderUserId: string;
    body: string;
    createdAt: string;
    clientMessageId?: string;
    readAt?: string | null;
    conversation?: { id: string };
}

export interface Conversation {
    id: string;
    partner: {
        id: string;
        name: string;
        photoUrl: string | null;
        isSystemSupport?: boolean;
    };
    lastMessage: {
        body: string;
        createdAt: string;
        senderId: string;
    } | null;
    updatedAt: string;
    isSupportChat?: boolean;
    unreadCount?: number;
}

export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUnreadCounts: builder.query<{ regular: number; support: number }, void>({
            query: () => '/conversations/unread-counts',
            providesTags: ['Conversation'],
        }),
        getConversations: builder.query<Conversation[], number | void>({
            query: (offset = 0) => ({ url: '/conversations', params: { offset } }),
            providesTags: ['Conversation'],
        }),
        getSupportConversations: builder.query<Conversation[], number | void>({
            query: (offset = 0) => ({ url: '/conversations/support', params: { offset } }),
            providesTags: ['Conversation'],
        }),
        getMessages: builder.query<{ data: Message[]; nextCursor: string | null }, { conversationId: string; before?: string }>({
            query: ({ conversationId, before }) => ({ url: `/conversations/${conversationId}/messages`, params: { before } }),
            keepUnusedDataFor: 20,
        }),
        sendMessage: builder.mutation<void, { conversationId: string; body: string }>({
            queryFn: () => ({ data: undefined }),
        }),
        markAsRead: builder.mutation<void, { conversationId: string; throughId: string }>({
            query: ({ conversationId, throughId }) => ({
                url: `/conversations/${conversationId}/read`,
                method: 'PATCH',
                body: { throughId },
            }),
            invalidatesTags: ['Conversation'],
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
    useGetUnreadCountsQuery,
    useGetConversationsQuery,
    useGetSupportConversationsQuery,
    useGetMessagesQuery,
    useLazyGetMessagesQuery,
    useBlockUserMutation,
    useReportUserMutation,
    useMarkAsReadMutation,
} = chatApi;
