import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Divider, Paper, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { useGetSupportConversationsQuery } from '../features/chat/api/chatApi';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AppEmptyState } from '../shared/ui/AppEmptyState';
import { ChatWindow } from '../features/chat/ui/ChatWindow';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

export const AdminChatsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { data: conversations, isLoading, isError } = useGetSupportConversationsQuery();
    const user = useSelector((state: RootState) => state.auth.user);

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    useEffect(() => {
        if (location.state && location.state.conversationId) {
            setSelectedConversationId(location.state.conversationId);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    const handleSelectConversation = (id: string) => {
        setSelectedConversationId(id);
    };

    const handleBackToList = () => {
        setSelectedConversationId(null);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default', gap: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.7 }}>Algo salió mal</Typography>
                <Typography variant="body2" sx={{ opacity: 0.5 }}>No pudimos cargar los chats de administración.</Typography>
            </Box>
        );
    }

    if (!conversations || conversations.length === 0) {
        return (
            <AppEmptyState
                title="Bandeja de Entrada Vacía"
                description="Aquí aparecerán los chats de consulta de los usuarios que utilicen OntoMatch."
                icon={ChatBubbleOutlineIcon}
                actionLabel="Volver al inicio"
                onAction={() => navigate('/')}
            />
        );
    }

    const selectedConversation = conversations?.find(c => c.id === selectedConversationId);

    const supportList = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Typography variant="h5" fontWeight="900" sx={{ p: 3, pb: 2, color: 'primary.main', letterSpacing: -0.5 }}>
                Soporte OntoMatch
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 2 }}>
                Bandeja de consultas directas de los usuarios
            </Typography>
            <Divider />
            <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
                    {conversations.map((conv) => {
                        const hasMessage = conv.lastMessage && conv.lastMessage.body;

                        let subtitleText = "Nueva conversación";
                        let timeString = "";

                        if (hasMessage && conv.lastMessage) {
                            const lastMsg: any = conv.lastMessage;
                            const isMe = lastMsg.senderId === user?.id || lastMsg.senderUserId === user?.id;
                            subtitleText = isMe ? `Tú: ${lastMsg.body}` : lastMsg.body;
                            timeString = new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }

                        const isSelected = selectedConversationId === conv.id;

                        return (
                            <div key={conv.id}>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => handleSelectConversation(conv.id)}
                                        selected={isSelected}
                                        sx={{
                                            py: 2, px: 3,
                                            bgcolor: isSelected ? '#FAF9F7' : 'transparent',
                                            '&:hover': { bgcolor: '#F5F4F0' }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                alt={conv.partner.name}
                                                src={conv.partner.photoUrl || undefined}
                                                sx={{ width: 52, height: 52, mr: 2 }}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                                                        {conv.partner.name}
                                                    </Typography>
                                                    {timeString && (
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                                                            {timeString}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        mt: 0.5
                                                    }}
                                                >
                                                    {subtitleText}
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <Divider variant="inset" component="li" sx={{ ml: 11, borderColor: '#F0F0F0' }} />
                            </div>
                        );
                    })}
                </List>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
            {isMobile ? (
                selectedConversationId ? (
                    <Box sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 2000,
                        bgcolor: 'background.default',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{ p: 2, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                            <IconButton onClick={handleBackToList} sx={{ mr: 1, p: 0.5 }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Avatar
                                src={selectedConversation?.partner.photoUrl || undefined}
                                sx={{ width: 36, height: 36, mr: 1.5 }}
                            />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {selectedConversation?.partner.name || 'Chat'} (Soporte)
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                            <ChatWindow conversationId={selectedConversationId} />
                        </Box>
                    </Box>
                ) : (
                    supportList
                )
            ) : (
                <Paper sx={{ height: '100%', display: 'flex', bgcolor: 'background.default', borderRadius: 0 }} elevation={0}>
                    <Box sx={{ width: 360, borderRight: 1, borderColor: 'divider' }}>
                        {supportList}
                    </Box>
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        {selectedConversationId ? (
                            <>
                                <Box sx={{ p: 2, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                                    <Avatar
                                        src={selectedConversation?.partner.photoUrl || undefined}
                                        sx={{ width: 40, height: 40, mr: 2 }}
                                    />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        {selectedConversation?.partner.name || 'Chat'} (Soporte)
                                    </Typography>
                                </Box>
                                <ChatWindow conversationId={selectedConversationId} />
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2, bgcolor: 'background.default' }}>
                                <ChatBubbleOutlineIcon sx={{ fontSize: 60, opacity: 0.2 }} />
                                <Typography variant="h6" sx={{ opacity: 0.5 }} color="text.secondary">
                                    Seleccioná un chat de soporte para responder
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
};
