
import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, useMediaQuery, useTheme } from '@mui/material';
import { ConversationList } from '../features/chat/ui/ConversationList';
import { ChatWindow } from '../features/chat/ui/ChatWindow';

export const ChatPage = () => {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', p: 2, bgcolor: '#f0f2f5' }}>
            <Paper sx={{ height: '100%', display: 'flex', overflow: 'hidden', borderRadius: 2 }}>
                {/* Sidebar (Conversation List) */}
                <Box sx={{
                    width: isMobile ? (selectedConversationId ? 0 : '100%') : 350,
                    borderRight: 1,
                    borderColor: 'divider',
                    display: isMobile && selectedConversationId ? 'none' : 'flex',
                    flexDirection: 'column'
                }}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6">Chats</Typography>
                    </Box>
                    <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                        <ConversationList onSelect={setSelectedConversationId} />
                    </Box>
                </Box>

                {/* Main Chat Area */}
                <Box sx={{
                    flexGrow: 1,
                    display: isMobile && !selectedConversationId ? 'none' : 'flex',
                    flexDirection: 'column',
                    bgcolor: '#efe7dd' // WhatsApp-ish background color
                }}>
                    {selectedConversationId ? (
                        <ChatWindow conversationId={selectedConversationId} />
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
                            <img src="/logo192.png" alt="OntoMatch" style={{ width: 100, opacity: 0.5 }} />
                            <Typography variant="h5" color="text.secondary">Select a chat to start messaging</Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};
