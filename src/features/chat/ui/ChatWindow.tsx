import React, { useEffect, useState, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Popover } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';
import { useGetMessagesQuery, useMarkAsReadMutation } from '../api/chatApi';
import { socketService } from '../../../shared/api/socket';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';

export const ChatWindow = ({ conversationId }: { conversationId: string }) => {
    const { data: initialMessages, refetch } = useGetMessagesQuery({ conversationId });
    const [markAsRead] = useMarkAsReadMutation();
    
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const token = useSelector((state: RootState) => state.auth.token);
    const user = useSelector((state: RootState) => state.auth.user);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    // Typing state
    const [isTyping, setIsTyping] = useState(false);
    const [partnerIsTyping, setPartnerIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setInputText(prev => prev + emojiData.emoji);
        triggerTypingIndicator();
    };

    const handleEmojiOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleEmojiClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    // Mark messages as read when opening or receiving new messages
    useEffect(() => {
        if (conversationId) {
            markAsRead({ conversationId });
        }
    }, [conversationId, messages, markAsRead]);

    useEffect(() => {
        if (initialMessages) {
            setMessages(initialMessages);
            scrollToBottom();
        }
    }, [initialMessages]);

    useEffect(() => {
        if (conversationId) {
            refetch(); // Fetch latest on switch
            setPartnerIsTyping(false); // Reset typing status on switch
        }
    }, [conversationId, refetch]);

    // WebSocket logic
    useEffect(() => {
        if (!token) return;

        const socket = socketService.connect(token);
        if (!socket) return;

        // Join Room
        socket.emit('joinConversation', conversationId);

        // Re-join on reconnect
        const handleReconnect = () => {
            socket.emit('joinConversation', conversationId);
        };
        socket.on('reconnect', handleReconnect);

        // Listen for new messages
        const handleMessage = (msg: any) => {
            if (msg.conversation.id === conversationId) {
                setMessages((prev) => {
                    const isDuplicate = prev.some(p => p.id === msg.id);
                    if (isDuplicate) return prev;

                    const optimisticIndex = prev.findIndex(p => p.isOptimistic && p.body === msg.body && p.senderUserId === msg.senderUserId);
                    if (optimisticIndex !== -1) {
                        const newMessages = [...prev];
                        newMessages[optimisticIndex] = msg;
                        return newMessages;
                    }
                    
                    return [...prev, msg];
                });
                scrollToBottom();
            }
        };

        // Listen for typing events
        const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
            if (data.userId !== user?.id) {
                setPartnerIsTyping(data.isTyping);
            }
        };

        socket.on('receiveMessage', handleMessage);
        socket.on('userTyping', handleUserTyping);

        return () => {
            socket.emit('leaveConversation', conversationId);
            socket.off('receiveMessage', handleMessage);
            socket.off('userTyping', handleUserTyping);
            socket.off('reconnect', handleReconnect);
        };
    }, [conversationId, token, user?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const triggerTypingIndicator = () => {
        const socket = socketService.getSocket();
        if (socket) {
            if (!isTyping) {
                setIsTyping(true);
                socket.emit('typing', { conversationId, isTyping: true });
            }

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                socket.emit('typing', { conversationId, isTyping: false });
            }, 2500); // 2.5 seconds debounce
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        triggerTypingIndicator();
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const body = inputText;
        setInputText('');
        
        // Cancel local typing immediately
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
        const socket = socketService.getSocket();
        if (socket) {
            socket.emit('typing', { conversationId, isTyping: false });
        }

        // Optimistic Update
        const tempMsg = {
            id: `temp-${Date.now()}`,
            body: body,
            senderUserId: user?.id,
            conversation: { id: conversationId },
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };
        setMessages(prev => [...prev, tempMsg]);
        setTimeout(scrollToBottom, 50);

        if (socket) {
            socket.emit('sendMessage', { conversationId, body });
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#F9F8F6' }}>
            {/* Scrollable message bubble field */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {messages.map((msg) => {
                    const isMe = msg.senderUserId === user?.id;
                    return (
                        <Box key={msg.id} sx={{
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                            mb: 0.2
                        }}>
                            <Box sx={{
                                p: 1.8,
                                px: 2.4,
                                maxWidth: '75%',
                                background: isMe
                                    ? 'linear-gradient(135deg, #ea00d9 0%, #711c91 100%)'
                                    : 'rgba(255, 255, 255, 0.95)',
                                color: isMe ? '#FFFFFF' : '#2C2C2E',
                                border: isMe ? 'none' : '1px solid rgba(0,0,0,0.06)',
                                borderRadius: '20px',
                                borderBottomRightRadius: isMe ? '4px' : '20px',
                                borderBottomLeftRadius: isMe ? '20px' : '4px',
                                boxShadow: isMe
                                    ? '0 4px 15px rgba(234,0,217,0.15)'
                                    : '0 4px 12px rgba(0,0,0,0.03)'
                            }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 400,
                                        fontSize: '0.96rem',
                                        lineHeight: 1.45,
                                        textAlign: 'left',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {msg.body}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: 0.5,
                                        mt: 0.6,
                                        fontSize: '0.65rem',
                                        fontWeight: '500',
                                        color: isMe ? 'rgba(255,255,255,0.7)' : '#8E8E93'
                                    }}
                                >
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && msg.isOptimistic && <span style={{ opacity: 0.8 }}> • Enviando...</span>}
                                    {isMe && !msg.isOptimistic && msg.readAt && <span style={{ color: '#00E676', fontWeight: 'bold' }}>✓✓</span>}
                                    {isMe && !msg.isOptimistic && !msg.readAt && <span style={{ opacity: 0.6 }}>✓</span>}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}

                {/* Real-time pulsing Typing indicator bubble */}
                {partnerIsTyping && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 0.5 }}>
                        <Box sx={{
                            p: 1.5,
                            px: 2.2,
                            background: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid rgba(0,0,0,0.06)',
                            borderRadius: '20px',
                            borderBottomLeftRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <Typography variant="caption" sx={{ color: '#8E8E93', fontWeight: '500', fontSize: '0.85rem' }}>
                                Escribiendo
                            </Typography>
                            <Box display="flex" gap={0.5} alignItems="center" sx={{ height: 10 }}>
                                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#ea00d9', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#ea00d9', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#ea00d9', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
                            </Box>
                            <style>{`
                                @keyframes bounce {
                                    0%, 80%, 100% { transform: scale(0.3); opacity: 0.4; }
                                    40% { transform: scale(1.0); opacity: 1; }
                                }
                            `}</style>
                        </Box>
                    </Box>
                )}
                
                <div ref={messagesEndRef} />
            </Box>

            {/* Bottom Input Area Card */}
            <Box sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: '#FFFFFF', boxShadow: '0 -4px 15px rgba(0,0,0,0.02)' }}>
                <IconButton onClick={handleEmojiOpen} sx={{ color: '#8E8E93', '&:hover': { color: '#ea00d9', bgcolor: 'rgba(234,0,217,0.05)' } }}>
                    <EmojiEmotionsIcon sx={{ fontSize: 24 }} />
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
                    <Box sx={{ width: 320, height: 380 }}>
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            autoFocusSearch={false}
                            width="100%"
                            height="100%"
                            theme={Theme.LIGHT}
                        />
                    </Box>
                </Popover>

                <Box sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: '#F2F2F7',
                    borderRadius: '24px',
                    px: 2.2,
                    py: 0.8,
                    border: '1px solid rgba(0,0,0,0.04)'
                }}>
                    <TextField
                        fullWidth
                        variant="standard"
                        placeholder="Escribe un mensaje..."
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                fontSize: '0.96rem',
                                color: '#1C1C1E',
                                fontWeight: 400,
                                '&::placeholder': { color: '#8E8E93', opacity: 1 }
                            }
                        }}
                    />
                </Box>
                
                <IconButton
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    sx={{
                        bgcolor: inputText.trim() ? '#ea00d9' : 'transparent',
                        color: inputText.trim() ? '#FFFFFF' : '#D1D1D6',
                        boxShadow: inputText.trim() ? '0 4px 10px rgba(234,0,217,0.2)' : 'none',
                        '&:hover': {
                            bgcolor: inputText.trim() ? '#711c91' : 'transparent',
                            color: inputText.trim() ? '#FFFFFF' : '#A1A1A6'
                        },
                        width: 40,
                        height: 40
                    }}
                >
                    <SendIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>
        </Box>
    );
};
