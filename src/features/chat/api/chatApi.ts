import { baseApi } from '../../../shared/api/baseApi';
import { Socket } from 'socket.io-client';

// Types
export interface Message {
    id: string;
    senderUserId: string;
    body: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    lastMessageAt: string;
    match: {
        userLowId: string;
        userHighId: string;
    };
}

export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query<Conversation[], void>({
            query: () => '/conversations',
            providesTags: ['Conversation'],
        }),
        getMessages: builder.query<Message[], { conversationId: string }>({
            query: ({ conversationId }) => `/conversations/${conversationId}/messages`,
            providesTags: (result, error, arg) => [{ type: 'Conversation', id: arg.conversationId }],
        }),
        sendMessage: builder.mutation<void, { conversationId: string; body: string }>({
            queryFn: () => ({ data: undefined }), // Socket only for sending? Or REST fall back? 
            // For MVP usually we use socket emit, but let's stick to REST for consistent history saving if easier, 
            // BUT our backend ChatGateway handles sendMessage. 
            // If we used REST endpoint in ChatController it would be standard. 
            // Since prompt specified "sendMessage persists", let's assume we do it via Socket in UI.
        }),
    }),
});

export const { useGetConversationsQuery, useGetMessagesQuery } = chatApi;
