import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../../../shared/api/socket';
import { chatApi } from '../../chat/api/chatApi';
import { useAcknowledgeCelebrationMutation, useGetPendingCelebrationsQuery, type Match } from '../api/matchesApi';

/** Lightweight new-chat notification. Persisted delivery covers users who were offline. */
export const MatchCelebrationQueue = () => {
    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: pending, refetch } = useGetPendingCelebrationsQuery(undefined, {
        skip: !token,
        refetchOnMountOrArgChange: true,
        refetchOnReconnect: true,
    });
    const [acknowledge] = useAcknowledgeCelebrationMutation();
    const [queue, setQueue] = useState<Match[]>([]);
    const delivered = useRef(new Set<string>());

    const mergeMatches = useCallback((matches: Match[]) => {
        if (!matches.length) return;
        setQueue(current => {
            const byId = new Map(current.map(match => [match.id, match]));
            for (const match of matches) {
                if (!delivered.current.has(match.id)) byId.set(match.id, match);
            }
            return [...byId.values()].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
        dispatch(chatApi.util.invalidateTags(['Conversation']));
    }, [dispatch]);

    useEffect(() => {
        if (pending?.length) mergeMatches(pending);
    }, [pending, mergeMatches]);

    useEffect(() => {
        if (!token) return;
        const socket = socketService.connect(token);
        const onMatch = (match: Match) => mergeMatches([match]);
        const onConnect = () => { void refetch(); };
        socket.on('newMatch', onMatch);
        socket.on('connect', onConnect);
        return () => {
            socket.off('newMatch', onMatch);
            socket.off('connect', onConnect);
        };
    }, [token, mergeMatches, refetch]);

    const current = queue[0];

    useEffect(() => {
        if (!current || delivered.current.has(current.id)) return;
        delivered.current.add(current.id);
        void acknowledge(current.id).unwrap().catch(() => {
            // A later reconnect will retry persisted delivery if the request failed.
            delivered.current.delete(current.id);
        });
    }, [current, acknowledge]);

    const finish = (openChat: boolean) => {
        if (!current) return;
        setQueue(matches => matches.slice(1));
        if (openChat) {
            navigate(current.conversationId ? `/matches?conversationId=${current.conversationId}` : '/matches');
        }
    };

    return (
        <Snackbar
            key={current?.id || 'new-chat'}
            open={Boolean(current)}
            autoHideDuration={5000}
            onClose={(_event, reason) => { if (reason !== 'clickaway') finish(false); }}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            message={current ? `¡Tenés un chat nuevo con ${current.partner.name}!` : ''}
            action={<Button color="inherit" size="small" onClick={() => finish(true)}>Abrir</Button>}
            ContentProps={{
                sx: {
                    bgcolor: '#343638',
                    color: '#fff',
                    borderRadius: 2.5,
                    boxShadow: '0 8px 24px rgba(0,0,0,.18)',
                },
            }}
        />
    );
};
