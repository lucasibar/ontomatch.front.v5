
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Divider, Paper, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { useGetConversationsQuery } from '../features/chat/api/chatApi';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AppEmptyState } from '../shared/ui/AppEmptyState';
import { ChatWindow } from '../features/chat/ui/ChatWindow';

export const MatchesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { data: conversations, isLoading, isError } = useGetConversationsQuery();

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#111' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#111', color: 'white', gap: 2 }}>
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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#111' }}>
            <Typography variant="h4" fontWeight="bold" sx={{ p: 2, pb: 2, color: 'white' }}>Matches</Typography>
            <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                <List sx={{ width: '100%', bgcolor: 'transparent' }}>
                    {conversations.map((conv) => {
                        const hasMessage = conv.lastMessage && conv.lastMessage.body;

                        let subtitleText = "";
                        let subtitleColor = "text.secondary";

                        if (hasMessage) {
                            subtitleText = conv.lastMessage!.body;
                            subtitleColor = "text.secondary";
                        } else {
                            subtitleText = "Tu turno de hablar";
                            subtitleColor = "rgba(255, 255, 255, 0.5)";
                        }

                        const isSelected = selectedConversationId === conv.id;

                        return (
                            <div key={conv.id}>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => handleSelectConversation(conv.id)}
                                        selected={isSelected}
                                        sx={{
                                            py: 2, px: 2,
                                            bgcolor: isSelected ? 'rgba(255, 255, 255, 0.08) !important' : 'transparent',
                                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
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
                                                <Typography variant="h6" fontWeight="bold" color="white">
                                                    {conv.partner.name}
                                                </Typography>
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
                                <Divider variant="inset" component="li" sx={{ borderColor: 'rgba(255,255,255,0.1)', ml: 10 }} />
                            </div>
                        );
                    })}
                </List>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', bgcolor: '#111', color: 'white' }}>
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
                            bgcolor: '#111',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <Box sx={{ p: 1, px: 2, bgcolor: '#222', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <IconButton onClick={handleBackToList} sx={{ color: 'white', mr: 1, p: 0.5 }}>
                                    <ArrowBackIcon />
                                </IconButton>
                                <Avatar
                                    src={selectedConversation?.partner.photoUrl || undefined}
                                    sx={{ width: 32, height: 32, mr: 1.5 }}
                                />
                                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                    {selectedConversation?.partner.name || 'Chat'}
                                </Typography>
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
                <Paper sx={{ height: '100%', display: 'flex', bgcolor: '#111', borderRadius: 0 }}>
                    <Box sx={{ width: 350, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        {matchesList}
                    </Box>
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        {selectedConversationId ? (
                            <ChatWindow conversationId={selectedConversationId} />
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2, bgcolor: '#000' }}>
                                <ChatBubbleOutlineIcon sx={{ fontSize: 60, opacity: 0.2, color: 'white' }} />
                                <Typography variant="h6" sx={{ opacity: 0.5 }}>Selecciona un chat para comenzar</Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
};
