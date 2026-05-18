
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Divider, Paper, useMediaQuery, useTheme, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useGetConversationsQuery, useBlockUserMutation, useReportUserMutation } from '../features/chat/api/chatApi';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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

    // Block/Report state
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [blockDialog, setBlockDialog] = useState(false);
    const [reportDialog, setReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [blockUser] = useBlockUserMutation();
    const [reportUser] = useReportUserMutation();

    const selectedConversation = conversations?.find(c => c.id === selectedConversationId);
    const partnerId = selectedConversation?.partner?.id;

    // Initialize selection from navigation state or query params if available
    useEffect(() => {
        if (location.state && location.state.conversationId) {
            setSelectedConversationId(location.state.conversationId);
            navigate(location.pathname, { replace: true, state: {} });
        } else {
            const params = new URLSearchParams(location.search);
            const convId = params.get('conversationId');
            if (convId) {
                setSelectedConversationId(convId);
                navigate(location.pathname, { replace: true });
            }
        }
    }, [location.state, location.search, navigate, location.pathname]);

    const handleSelectConversation = (id: string) => {
        setSelectedConversationId(id);
    };

    const handleBackToList = () => {
        setSelectedConversationId(null);
    };

    const handleBlock = async () => {
        if (!partnerId) return;
        try {
            await blockUser({ blockedId: partnerId }).unwrap();
            setBlockDialog(false);
            setSelectedConversationId(null);
        } catch (e) {
            console.error('Block failed', e);
        }
    };

    const handleReport = async () => {
        if (!partnerId || reportReason.length < 5) return;
        try {
            await reportUser({ reportedId: partnerId, reason: reportReason }).unwrap();
            setReportDialog(false);
            setReportReason('');
            setSelectedConversationId(null);
        } catch (e) {
            console.error('Report failed', e);
        }
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
                                                    <Typography variant="subtitle1" fontWeight={conv.unreadCount ? "700" : "500"} color="text.primary">
                                                        {conv.partner.name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                                        {timeString && (
                                                            <Typography variant="caption" sx={{ color: conv.unreadCount ? '#ea00d9' : 'text.secondary', fontWeight: conv.unreadCount ? 'bold' : 'normal', opacity: 0.8 }}>
                                                                {timeString}
                                                            </Typography>
                                                        )}
                                                        {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                                                            <Box sx={{
                                                                minWidth: 18,
                                                                height: 18,
                                                                borderRadius: 9,
                                                                bgcolor: '#ea00d9',
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 'bold',
                                                                px: 0.5,
                                                                boxShadow: '0 2px 5px rgba(234,0,217,0.3)'
                                                            }}>
                                                                {conv.unreadCount}
                                                            </Box>
                                                        )}
                                                    </Box>
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
                                <Box sx={{ ml: 'auto' }}>
                                    <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small">
                                        <MoreVertIcon />
                                    </IconButton>
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
                                            <Box sx={{ ml: 'auto' }}>
                                                <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small">
                                                    <MoreVertIcon />
                                                </IconButton>
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
                onActionSuccess={() => setSelectedConversationId(null)}
            />

            {/* 3-dot Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
            >
                <MenuItem onClick={() => { setMenuAnchor(null); setBlockDialog(true); }}>
                    Bloquear
                </MenuItem>
                <MenuItem onClick={() => { setMenuAnchor(null); setReportDialog(true); }} sx={{ color: 'error.main' }}>
                    Reportar
                </MenuItem>
            </Menu>

            {/* Block Confirmation */}
            <Dialog open={blockDialog} onClose={() => setBlockDialog(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle>¿Bloquear a {selectedConversation?.partner?.name}?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Ya no van a poder verse ni escribirse. Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBlockDialog(false)}>Cancelar</Button>
                    <Button onClick={handleBlock} color="error" variant="contained" disableElevation>Bloquear</Button>
                </DialogActions>
            </Dialog>

            {/* Report Dialog */}
            <Dialog open={reportDialog} onClose={() => setReportDialog(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle>Reportar a {selectedConversation?.partner?.name}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Contanos qué pasó. Si 2 personas reportan al mismo usuario, su cuenta se suspende automáticamente.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Describe el motivo del reporte..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setReportDialog(false); setReportReason(''); }}>Cancelar</Button>
                    <Button onClick={handleReport} color="error" variant="contained" disableElevation disabled={reportReason.length < 5}>Reportar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
