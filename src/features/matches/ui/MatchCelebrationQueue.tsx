import { useEffect, useRef, useState } from 'react';
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getOptimizedCloudinaryUrl } from '../../../shared/ui/ImageWithFallback';
import { socketService } from '../../../shared/api/socket';
import { useAcknowledgeCelebrationMutation, useGetPendingCelebrationsQuery, type Match } from '../api/matchesApi';

export const MatchCelebrationQueue = () => {
    const token = localStorage.getItem('token');
    const { data: pending } = useGetPendingCelebrationsQuery(undefined, { skip: !token });
    const [acknowledge] = useAcknowledgeCelebrationMutation();
    const [queue, setQueue] = useState<Match[]>([]);
    const dismissed = useRef(new Set<string>());
    const navigate = useNavigate();

    const mergeMatches = (matches: Match[]) => {
        setQueue(current => {
            const byId = new Map(current.map(match => [match.id, match]));
            for (const match of matches) if (!dismissed.current.has(match.id)) byId.set(match.id, match);
            return [...byId.values()].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
    };

    useEffect(() => {
        if (pending?.length) mergeMatches(pending);
    }, [pending]);

    useEffect(() => {
        if (!token) return;
        const socket = socketService.connect(token);
        const onMatch = (match: Match) => mergeMatches([match]);
        socket.on('newMatch', onMatch);
        return () => { socket.off('newMatch', onMatch); };
    }, [token]);

    const current = queue[0];
    const finish = (goToChat: boolean) => {
        if (!current) return;
        dismissed.current.add(current.id);
        setQueue(matches => matches.slice(1));
        void acknowledge(current.id);
        if (goToChat) navigate(current.conversationId ? `/matches?conversationId=${current.conversationId}` : '/matches');
    };

    return (
        <Dialog
            open={!!current}
            onClose={() => finish(false)}
            maxWidth="xs"
            fullWidth
            slotProps={{ backdrop: { sx: { bgcolor: 'rgba(18,18,18,.54)', backdropFilter: 'blur(3px)' } }, paper: { sx: { mx: 2.5, borderRadius: 4, boxShadow: '0 20px 65px rgba(0,0,0,.24)' } } }}
        >
            {current && <>
                <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2.5 }}>
                    <motion.div initial={{ opacity: 0, scale: .92, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .32, ease: 'easeOut' }}>
                        <Box sx={{ width: 42, height: 42, borderRadius: '50%', display: 'grid', placeItems: 'center', mx: 'auto', mb: 2, bgcolor: '#f1efec', color: '#3a3a3c' }}>
                            <FavoriteRoundedIcon sx={{ fontSize: 21 }} />
                        </Box>
                        <Typography variant="h5" fontWeight={650} sx={{ mb: .7 }}>Hicieron match</Typography>
                        <Typography color="text.secondary" sx={{ mb: 2.5 }}>A vos y a {current.partner.name} les gustaría conocerse.</Typography>
                        <Avatar
                            src={current.partner.photoUrl ? getOptimizedCloudinaryUrl(current.partner.photoUrl, 'w_320,h_320,c_fill,g_face,q_auto,f_auto') : undefined}
                            alt={current.partner.name}
                            sx={{ width: 126, height: 126, mx: 'auto', bgcolor: '#dedbd6', fontSize: '2.5rem', border: '4px solid #fff', boxShadow: '0 8px 30px rgba(0,0,0,.14)' }}
                        >
                            {current.partner.name.charAt(0)}
                        </Avatar>
                        <Typography sx={{ mt: 1.5, fontWeight: 600, fontSize: '1.05rem' }}>{current.partner.name}</Typography>
                    </motion.div>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
                    <Button fullWidth onClick={() => finish(false)} color="inherit">Seguir</Button>
                    <Button fullWidth variant="contained" onClick={() => finish(true)}>Ir al chat</Button>
                </DialogActions>
            </>}
        </Dialog>
    );
};
