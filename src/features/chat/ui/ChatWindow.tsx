import { useEffect, useState, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Typography, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f5f5f5' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.map((msg) => {
                    const isMe = msg.senderUserId === user?.id;
                    return (
                        <Box key={msg.id} sx={{
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                        }}>
                            <Paper sx={{
                                p: 1.5,
                                px: 2,
                                borderRadius: 4,
                                bgcolor: isMe ? '#dcf8c6' : 'white', // WhatsApp style (Light Green / White)
                                borderTopRightRadius: isMe ? 0 : 4,
                                borderTopLeftRadius: !isMe ? 0 : 4,
                                maxWidth: '70%',
                                boxShadow: 1
                            }}>
                                <Typography variant="body1" sx={{ color: 'black' }}>{msg.body}</Typography>
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: 'text.secondary', fontSize: '0.7rem' }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Paper>
                        </Box>
                    );
                })}
                <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 2, display: 'flex', gap: 1, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    size="small"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
                <IconButton color="primary" onClick={handleSend} disabled={!inputText.trim()}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};
