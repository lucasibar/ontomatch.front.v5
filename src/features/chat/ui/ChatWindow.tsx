import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, Popover, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { useGetMessagesQuery, useLazyGetMessagesQuery, useMarkAsReadMutation, type Message } from '../api/chatApi';
import { socketService } from '../../../shared/api/socket';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import EmojiPicker from 'emoji-picker-react';

type LocalMessage = Message & { delivery?: 'sending' | 'failed' };
function mergeMessages(previous: LocalMessage[], incoming: LocalMessage[]) {
    const result = [...previous];
    for (const message of incoming) {
        const index = result.findIndex(p => p.id === message.id || (message.clientMessageId && p.clientMessageId === message.clientMessageId && p.senderUserId === message.senderUserId));
        if (index < 0) result.push(message);
        else result[index] = message;
    }
    return result.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

export const ChatWindow = ({ conversationId }: { conversationId: string }) => <ConversationWindow key={conversationId} conversationId={conversationId} />;

function ConversationWindow({ conversationId }: { conversationId: string }) {
    const { data: page, isLoading, isError, refetch } = useGetMessagesQuery({ conversationId }, { refetchOnMountOrArgChange: true });
    const [loadOlder, { isFetching: loadingOlder }] = useLazyGetMessagesQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [connected, setConnected] = useState(false);
    const [emojiAnchor, setEmojiAnchor] = useState<HTMLButtonElement | null>(null);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const token = useSelector((s: RootState) => s.auth.token);
    const userId = useSelector((s: RootState) => s.auth.user?.id) as string | undefined;
    const scroll = useRef<HTMLDivElement>(null);
    const nearBottom = useRef(true);
    const initial = useRef(true);
    const readThrough = useRef('');
    const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const lastTyping = useRef(0);

    useEffect(() => {
        if (!page) return;
        setMessages(previous => mergeMessages(previous, page.data));
        // Preserve the oldest loaded cursor when the latest page refreshes on reconnect.
        if (initial.current) { setCursor(page.nextCursor); initial.current = false; }
    }, [page]);

    useEffect(() => {
        if (!token) return;
        const socket = socketService.connect(token);
        let disposed = false;
        let refreshing = false;
        let receivedDuringRefresh: Message[] = [];
        const onConnect = () => {
            setConnected(true);
            socket.emit('joinConversation', conversationId);
            refreshing = true;
            receivedDuringRefresh = [];
            void refetch().unwrap().then(result => {
                if (disposed) return;
                nearBottom.current = true;
                setMessages(previous => mergeMessages(previous.filter(message => message.delivery), [...result.data, ...receivedDuringRefresh]));
                setCursor(result.nextCursor);
            }).catch(() => setError('No pudimos actualizar el chat. Intentá recargarlo.')).finally(() => { refreshing = false; });
        };
        const onDisconnect = () => setConnected(false);
        const onMessage = (message: Message) => {
            if (message.conversation?.id === conversationId) {
                if (refreshing) receivedDuringRefresh.push(message);
                setMessages(previous => mergeMessages(previous, [message]));
            }
        };
        const onTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
            if (data.conversationId !== conversationId || data.userId === userId) return;
            setPartnerTyping(data.isTyping);
            clearTimeout(typingTimer.current);
            typingTimer.current = setTimeout(() => setPartnerTyping(false), 3000);
        };
        setConnected(socket.connected);
        if (socket.connected) onConnect();
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onDisconnect);
        socket.on('receiveMessage', onMessage);
        socket.on('userTyping', onTyping);
        return () => {
            disposed = true;
            clearTimeout(typingTimer.current);
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onDisconnect);
            socket.off('receiveMessage', onMessage);
            socket.off('userTyping', onTyping);
        };
    }, [conversationId, token, userId, refetch]);

    useEffect(() => {
        if (nearBottom.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
    }, [messages, partnerTyping]);

    const readVisible = () => {
        if (document.visibilityState !== 'visible' || !nearBottom.current) return;
        const last = [...messages].reverse().find(m => m.senderUserId !== userId && !m.delivery);
        if (!last || last.readAt || readThrough.current === last.id) return;
        readThrough.current = last.id;
        void markAsRead({ conversationId, throughId: last.id }).unwrap().catch(() => { readThrough.current = ''; });
    };
    useEffect(() => {
        readVisible();
        document.addEventListener('visibilitychange', readVisible);
        return () => document.removeEventListener('visibilitychange', readVisible);
    }, [messages, conversationId, userId, markAsRead]);

    const older = async () => {
        if (!cursor || !scroll.current) return;
        const node = scroll.current;
        const previousHeight = node.scrollHeight;
        nearBottom.current = false;
        try {
            const result = await loadOlder({ conversationId, before: cursor }).unwrap();
            setMessages(previous => mergeMessages(previous, result.data));
            setCursor(result.nextCursor);
            requestAnimationFrame(() => { node.scrollTop += node.scrollHeight - previousHeight; });
        } catch { setError('No pudimos cargar los mensajes anteriores. Volvé a intentarlo.'); }
    };

    const deliver = async (message: LocalMessage) => {
        const socket = socketService.getSocket();
        if (!socket?.connected) { setError('Esperá a recuperar la conexión para enviar.'); return; }
        setMessages(previous => mergeMessages(previous, [{ ...message, delivery: 'sending' }]));
        try {
            const result = await socket.timeout(12000).emitWithAck('sendMessage', { conversationId, body: message.body, clientMessageId: message.clientMessageId }) as { ok: boolean; message?: Message; error?: string };
            if (!result.ok || !result.message) throw new Error(result.error || 'No pudimos enviar el mensaje.');
            setMessages(previous => mergeMessages(previous, [result.message!]));
        } catch {
            setMessages(previous => previous.map(m => m.id === message.id && m.delivery === 'sending' ? { ...m, delivery: 'failed' } : m));
        }
    };
    const send = () => {
        if (!text.trim() || !userId || !connected) return;
        const clientMessageId = crypto.randomUUID();
        const message: LocalMessage = { id: clientMessageId, clientMessageId, body: text.trim(), senderUserId: userId, createdAt: new Date().toISOString() };
        setText('');
        setError('');
        nearBottom.current = true;
        socketService.getSocket()?.emit('typing', { conversationId, isTyping: false });
        void deliver(message);
    };

    return <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        {!connected && <Alert severity="info">Reconectando al chat…</Alert>}
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        {isError && <Alert severity="error" action={<Button onClick={refetch}>Reintentar</Button>}>No pudimos cargar el chat.</Alert>}
        <Box ref={scroll} onScroll={() => {
            const node = scroll.current!;
            nearBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 60;
            readVisible();
        }} sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {isLoading && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
            {cursor && <Button onClick={older} disabled={loadingOlder}>{loadingOlder ? 'Cargando…' : 'Ver mensajes anteriores'}</Button>}
            {!isLoading && !isError && !messages.length && <Typography color="text.secondary" textAlign="center">Podés empezar con un hola.</Typography>}
            {messages.map(message => {
                const mine = message.senderUserId === userId;
                return <Box key={message.id} sx={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', bgcolor: mine ? '#343638' : '#FFFFFF', color: mine ? '#FFFFFF' : '#252729', px: 2, py: 1.25, borderRadius: 3 }}>
                    <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{message.body}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.8 }}>
                        {new Date(message.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        {message.delivery === 'sending' ? ' · Enviando…' : !message.delivery && mine ? ' · Enviado' : ''}
                    </Typography>
                    {message.delivery === 'failed' && <Button size="small" disabled={!connected} onClick={() => deliver(message)} sx={{ color: 'inherit' }}>No se confirmó. Reintentar</Button>}
                </Box>;
            })}
            {partnerTyping && <Typography variant="caption" color="text.secondary">Escribiendo…</Typography>}
        </Box>
        <Box component="form" onSubmit={e => { e.preventDefault(); send(); }} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFFFFF', borderTop: '1px solid #E5E5E5' }}>
            <IconButton aria-label="Agregar emoji" onClick={e => setEmojiAnchor(e.currentTarget)}><EmojiIcon /></IconButton>
            <Popover open={Boolean(emojiAnchor)} anchorEl={emojiAnchor} onClose={() => setEmojiAnchor(null)} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                {emojiAnchor && <EmojiPicker width={300} height={360} onEmojiClick={emoji => setText(previous => (previous + emoji.emoji).slice(0, 4000))} />}
            </Popover>
            <TextField fullWidth size="small" label="Mensaje" placeholder="Escribí un mensaje…" multiline maxRows={4} value={text} inputProps={{ maxLength: 4000 }} onChange={e => {
                setText(e.target.value);
                if (connected && Date.now() - lastTyping.current > 2000) {
                    lastTyping.current = Date.now();
                    socketService.getSocket()?.emit('typing', { conversationId, isTyping: true });
                }
            }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
            <IconButton aria-label="Enviar mensaje" type="submit" disabled={!text.trim() || !connected}><SendIcon /></IconButton>
        </Box>
    </Box>;
}
