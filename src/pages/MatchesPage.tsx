import { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { ConversationList } from '../features/chat/ui/ConversationList';
import { ChatWindow } from '../features/chat/ui/ChatWindow';

export const MatchesPage = () => {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    return (
        <Grid container sx={{ height: 'calc(100vh - 64px)' }}>
            <Grid size={{ xs: 12, md: 4 }} sx={{ borderRight: 1, borderColor: 'divider' }}>
                <Typography variant="h6" p={2}>Matches</Typography>
                <ConversationList onSelect={setSelectedConversationId} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
                {selectedConversationId ? (
                    <ChatWindow conversationId={selectedConversationId} />
                ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography color="text.secondary">Select a match to start chatting</Typography>
                    </Box>
                )}
            </Grid>
        </Grid>
    );
};
