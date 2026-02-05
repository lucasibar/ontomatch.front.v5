import { useEffect, useState, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useGetMessagesQuery } from '../api/chatApi';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';

export const ChatWindow = ({ conversationId }: { conversationId: string }) => {
    const { data: initialMessages } = useGetMessagesQuery({ conversationId });
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const token = useSelector((state: RootState) => state.auth.token);
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        if (initialMessages) setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        // Connect Socket
        const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
            auth: { token },
            path: '/socket.io' // default
        });

        // Join Room
        newSocket.emit('joinConversation', { conversationId });

        // Listen
        newSocket.on('messageReceived', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socketRef.current = newSocket;

        return () => {
            newSocket.disconnect();
        };
    }, [conversationId, token]);

    const handleSend = () => {
        if (!inputText.trim() || !socketRef.current) return;

        // Emit through socket
        socketRef.current.emit('sendMessage', { conversationId, body: inputText });

        // Optimistic append?? Or wait for echo? 
        // Backend emits messageReceived to room, so we should receive our own message if joined.
        // Or we append optimistically

        setInputText('');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                {messages.map((msg) => (
                    <Box key={msg.id} sx={{
                        display: 'flex',
                        justifyContent: msg.senderUserId === user?.id ? 'flex-end' : 'flex-start',
                        mb: 1
                    }}>
                        <Paper sx={{
                            p: 1.5,
                            bgcolor: msg.senderUserId === user?.id ? 'primary.main' : 'background.paper',
                            maxWidth: '70%'
                        }}>
                            <Typography variant="body1">{msg.body}</Typography>
                        </Paper>
                    </Box>
                ))}
            </Box>

            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <IconButton color="primary" onClick={handleSend}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};
