import { useEffect, useState, useRef } from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
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
                            mb: 0.5 // Reduced spacing
                        }}>
                            {/* Debugging Logic - remove in production */}
                            {/* console.log('Me:', user?.id, 'Sender:', msg.senderUserId, 'isMe:', isMe) */}

                            <Box sx={{
                                p: 1,
                                px: 2,
                                maxWidth: '75%',
                            }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 'normal',
                                        fontSize: '1rem',
                                        lineHeight: 1.2,
                                        color: isMe ? 'black' : '#E91E63', // User: Black, Partner: Pink
                                        textAlign: isMe ? 'right' : 'left'
                                    }}
                                >
                                    {msg.body}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        textAlign: isMe ? 'right' : 'left',
                                        mt: 0.2,
                                        opacity: 0.6,
                                        fontSize: '0.65rem',
                                        color: 'gray'
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

            <Box sx={{ p: 2, display: 'flex', gap: 1, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    size="small"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    sx={{
                        bgcolor: 'white',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-input': {
                            color: 'black'
                        }
                    }}
                />
                <IconButton color="primary" onClick={handleSend} disabled={!inputText.trim()}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};
