import { List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Typography, Divider } from '@mui/material';
import { useGetConversationsQuery } from '../api/chatApi';

export const ConversationList = ({ onSelect }: { onSelect: (id: string) => void }) => {
    const { data: conversations, isLoading } = useGetConversationsQuery();

    if (isLoading) return <div>Loading chats...</div>;
    if (!conversations?.length) return <div>No matches yet. Keep swiping!</div>;

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {conversations.map((conv) => (
                <div key={conv.id}>
                    <ListItem alignItems="flex-start" disablePadding>
                        <ListItemButton onClick={() => onSelect(conv.id)}>
                            <ListItemAvatar>
                                <Avatar alt="User" src="/static/images/avatar/1.jpg" />
                            </ListItemAvatar>
                            <ListItemText
                                primary="Match Name" // We need to resolve other user name based on match/profile
                                secondary={
                                    <Typography variant="body2" color="text.primary">
                                        {/* Last message preview if available */}
                                        Start chatting...
                                    </Typography>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                </div>
            ))}
        </List>
    );
};
