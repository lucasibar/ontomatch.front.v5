
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Divider, Paper, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { useGetConversationsQuery } from '../features/chat/api/chatApi';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AppEmptyState } from '../shared/ui/AppEmptyState';
import { ChatWindow } from '../features/chat/ui/ChatWindow';
import { PartnerProfileView } from '../features/chat/ui/PartnerProfileView';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

export const MatchesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { data: conversations, isLoading, isError } = useGetConversationsQuery();
    const user = useSelector((state: RootState) => state.auth.user);

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [viewingPartnerId, setViewingPartnerId] = useState<string | null>(null);

    // Initialize selection from navigation state if available
    useEffect(() => {
        if (location.state && location.state.conversationId) {
            setSelectedConversationId(location.state.conversationId);
            // Clear state so back button works expectedly
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
                <Typography variant="body2" sx={{ opacity: 0.5 }}>No pudimos cargar tus conversaciones.</Typography>
            </Box>
        );
    }

    if (!conversations || conversations.length === 0) {
        return (
            <AppEmptyState
                title="¡Todo empieza con un Hola!"
                description="Sigue dando likes. ¡Tu próxima gran conexión está a un swipe de distancia!"
                icon={ChatBubbleOutlineIcon}
                actionLabel="Ir a descubrir"
                onAction={() => navigate('/')}
            />
        );
    }

    // List Component Content
    const matchesList = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Typography variant="h5" fontWeight="500" sx={{ p: 3, pb: 2, color: 'text.primary' }}>Matches</Typography>
            <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                <List sx={{ width: '100%', bgcolor: 'transparent' }}>
                    {conversations.map((conv) => {
                        const hasMessage = conv.lastMessage && conv.lastMessage.body;

                        let subtitleText = "";
                        let subtitleColor = "text.secondary";
                        let timeString = "";

                        if (hasMessage && conv.lastMessage) {
                            const lastMsg: any = conv.lastMessage;
                            const isMe = lastMsg.senderUserId === user?.id;
                            subtitleText = isMe ? `Vos: ${lastMsg.body}` : lastMsg.body;
                            subtitleColor = "text.secondary";
                            timeString = new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } else {
                            subtitleText = "Tu turno de hablar";
                            subtitleColor = "text.secondary";
                        }

                        const isSelected = selectedConversationId === conv.id;

                        return (
                            <div key={conv.id}>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => handleSelectConversation(conv.id)}
                                        selected={isSelected}
                                        sx={{
                                            py: 1.5, px: 3,
                                            bgcolor: isSelected ? '#FAF9F7' : 'transparent',
                                            '&:hover': { bgcolor: '#F5F4F0' }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                alt={conv.partner.name}
                                                src={conv.partner.photoUrl || undefined}
                                                sx={{ width: 56, height: 56, mr: 2 }}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle1" fontWeight="500" color="text.primary">
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
                                                        color: subtitleColor,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
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
                // Mobile Layout: Switch between List and Chat
                selectedConversationId ? (() => {
                    const selectedConversation = conversations?.find(c => c.id === selectedConversationId);
                    return (
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
                            <Box sx={{ p: 1, px: 2, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                                <IconButton onClick={handleBackToList} sx={{ mr: 1, p: 0.5 }}>
                                    <ArrowBackIcon />
                                </IconButton>
                                <Box
                                    onClick={() => {
                                        console.log('Opening profile for:', selectedConversation?.partner.id);
                                        setViewingPartnerId(selectedConversation?.partner.id || null);
                                    }}
                                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                                >
                                    <Avatar
                                        src={selectedConversation?.partner.photoUrl || undefined}
                                        sx={{ width: 32, height: 32, mr: 1.5 }}
                                    />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                        {selectedConversation?.partner.name || 'Chat'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                <ChatWindow conversationId={selectedConversationId} />
                            </Box>
                        </Box>
                    );
                })() : (
                    matchesList
                )
            ) : (
                // Desktop Layout: Split View
                <Paper sx={{ height: '100%', display: 'flex', bgcolor: 'background.default', borderRadius: 0 }}>
                    <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider' }}>
                        {matchesList}
                    </Box>
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        {selectedConversationId ? (
                            <>
                                {(() => {
                                    const selectedConversation = conversations?.find(c => c.id === selectedConversationId);
                                    return (
                                        <Box sx={{ p: 1, px: 3, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                                            <Box
                                                onClick={() => {
                                                    console.log('Opening profile for (desktop):', selectedConversation?.partner.id);
                                                    setViewingPartnerId(selectedConversation?.partner.id || null);
                                                }}
                                                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                                            >
                                                <Avatar
                                                    src={selectedConversation?.partner.photoUrl || undefined}
                                                    sx={{ width: 40, height: 40, mr: 2 }}
                                                />
                                                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                                    {selectedConversation?.partner.name || 'Chat'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })()}
                                <ChatWindow conversationId={selectedConversationId} />
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2, bgcolor: 'background.default' }}>
                                <ChatBubbleOutlineIcon sx={{ fontSize: 60, opacity: 0.2 }} />
                                <Typography variant="h6" sx={{ opacity: 0.5 }} color="text.secondary">Selecciona un chat para comenzar</Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            )}

            <PartnerProfileView
                userId={viewingPartnerId}
                open={Boolean(viewingPartnerId)}
                onClose={() => setViewingPartnerId(null)}
            />
        </Box>
    );
};
