import React, { useEffect, useState, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Popover } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';
import { useGetMessagesQuery } from '../api/chatApi';
import { socketService } from '../../../shared/api/socket';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';

export const ChatWindow = ({ conversationId }: { conversationId: string }) => {
    const { data: initialMessages, refetch } = useGetMessagesQuery({ conversationId });
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const token = useSelector((state: RootState) => state.auth.token);
    const user = useSelector((state: RootState) => state.auth.user);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setInputText(prev => prev + emojiData.emoji);
    };

    const handleEmojiOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleEmojiClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    useEffect(() => {
        if (initialMessages) {
            setMessages(initialMessages);
            scrollToBottom();
        }
    }, [initialMessages]);

    useEffect(() => {
        if (conversationId) {
            refetch(); // Fetch latest on switch
        }
    }, [conversationId, refetch]);

    useEffect(() => {
        if (!token) return;

        const socket = socketService.connect(token);
        if (!socket) return;

        // Join Room
        socket.emit('joinConversation', conversationId);

        // Listen
        const handleMessage = (msg: any) => {
            if (msg.conversation.id === conversationId) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            }
        };

        socket.on('receiveMessage', handleMessage);

        return () => {
            socket.emit('leaveConversation', conversationId);
            socket.off('receiveMessage', handleMessage);
        };
    }, [conversationId, token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const socket = socketService.getSocket();
        if (socket) {
            socket.emit('sendMessage', { conversationId, body: inputText });
            setInputText('');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.map((msg) => {
                    const isMe = msg.senderUserId === user?.id;
                    return (
                        <Box key={msg.id} sx={{
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                            mb: 0.5 // Reduced spacing
                        }}>
                            {/* Debugging Logic - remove in production */}
                            {/* console.log('Me:', user?.id, 'Sender:', msg.senderUserId, 'isMe:', isMe) */}

                            <Box sx={{
                                p: 1.5,
                                px: 2,
                                maxWidth: '75%',
                                bgcolor: isMe ? '#3A3A3C' : '#F0F0F0',
                                borderRadius: 3,
                                borderBottomRightRadius: isMe ? 0 : 3,
                                borderBottomLeftRadius: isMe ? 3 : 0,
                            }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 400,
                                        fontSize: '0.95rem',
                                        lineHeight: 1.4,
                                        color: isMe ? '#FFFFFF' : '#2C2C2E',
                                        textAlign: 'left'
                                    }}
                                >
                                    {msg.body}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        textAlign: 'right',
                                        mt: 0.5,
                                        fontSize: '0.65rem',
                                        color: isMe ? 'rgba(255,255,255,0.6)' : '#71717A'
                                    }}
                                >
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
                <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'center', borderTop: '1px solid #F0F0F0', bgcolor: '#FFFFFF' }}>
                <IconButton onClick={handleEmojiOpen} sx={{ color: '#8E8E93', '&:hover': { color: '#3A3A3C', bgcolor: 'transparent' } }}>
                    <EmojiEmotionsIcon />
                </IconButton>

                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleEmojiClose}
                    disableRestoreFocus
                    disableEnforceFocus
                    disablePortal
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    sx={{
                        zIndex: 9999,
                        '& .MuiPaper-root': {
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            border: '1px solid #F0F0F0'
                        }
                    }}
                >
                    <Box sx={{ width: 350, height: 400 }}>
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            autoFocusSearch={false}
                            width="100%"
                            height="100%"
                            theme={Theme.LIGHT}
                        />
                    </Box>
                </Popover>

                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Escribe un mensaje..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    InputProps={{
                        disableUnderline: true,
                        sx: {
                            fontSize: '0.95rem',
                            color: '#2C2C2E',
                            fontWeight: 300,
                            '&::placeholder': { color: '#8E8E93', opacity: 1 }
                        }
                    }}
                />
                
                <IconButton
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    sx={{
                        color: '#3A3A3C',
                        '&:hover': { bgcolor: 'transparent', color: '#1C1C1E' },
                        '&.Mui-disabled': { color: '#D1D1D6' }
                    }}
                >
                    <SendIcon sx={{ fontSize: 22 }} />
                </IconButton>
            </Box>
        </Box>
    );
};
