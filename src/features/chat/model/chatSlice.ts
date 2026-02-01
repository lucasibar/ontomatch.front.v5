import { createSlice } from '@reduxjs/toolkit';

interface ChatState {
    activeConversationId: string | null;
}

const initialState: ChatState = {
    activeConversationId: null,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {},
});

export default chatSlice.reducer;
