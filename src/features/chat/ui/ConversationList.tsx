import { List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Typography, Divider } from '@mui/material';
import { useGetConversationsQuery } from '../api/chatApi';
import { getOptimizedCloudinaryUrl } from '../../../shared/ui/ImageWithFallback';

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
                                <Avatar alt={conv.partner.name} src={conv.partner.photoUrl ? getOptimizedCloudinaryUrl(conv.partner.photoUrl, 'w_100,c_fill,g_face,q_auto,f_auto') : undefined} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={conv.partner.name}
                                secondary={
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        {conv.lastMessage ? conv.lastMessage.body : 'Start chatting...'}
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
