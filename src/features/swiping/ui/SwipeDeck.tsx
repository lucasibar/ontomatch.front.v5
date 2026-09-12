import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import SwipeCard from './SwipeCard';
import { useLazyGetFeedQuery, usePostSwipeMutation, useRestartPassedProfilesMutation } from '../api/swipesApi';
import { useGetPreferencesQuery } from '../../onboarding/api/profileApi';
import { matchesApi } from '../../matches/api/matchesApi';
import type { Profile } from '../types';

export default function SwipeDeck() {
    const dispatch = useDispatch();
    const { data: rawPreferences, isError: preferencesError, refetch: retryPreferences } = useGetPreferencesQuery(undefined);
    const preferences = rawPreferences as { ageMin: number; ageMax: number; distanceKm: number; gendersAllowed: string[] } | undefined;
    const [getFeed, { isFetching }] = useLazyGetFeedQuery();
    const [postSwipe] = usePostSwipeMutation();
    const [restartPassedProfiles, { isLoading: restarting }] = useRestartPassedProfilesMutation();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [error, setError] = useState('');
    const [ready, setReady] = useState(false);
    const busy = useRef(false);
    const prefetching = useRef(false);
    const generation = useRef(0);
    const [waiting, setWaiting] = useState(false);
    const params = useMemo(() => ({
        limit: 10,
        minAge: preferences?.ageMin,
        maxAge: preferences?.ageMax,
        distanceKm: preferences?.distanceKm,
        genders: preferences?.gendersAllowed,
    }), [preferences?.ageMin, preferences?.ageMax, preferences?.distanceKm, preferences?.gendersAllowed]);

    const refresh = useCallback(async () => {
        const current = ++generation.current;
        setError('');
        try {
            const result = await getFeed(params).unwrap();
            if (current === generation.current) { setProfiles(result); setReady(true); setWaiting(false); }
        } catch {
            if (current === generation.current) { setError('No pudimos cargar los perfiles.'); setReady(true); }
        }
    }, [getFeed, params]);

    const prefetch = () => {
        if (prefetching.current) return;
        prefetching.current = true;
        const current = generation.current;
        void getFeed(params).unwrap()
            .then(batch => {
                if (current === generation.current) setProfiles(previous => [...previous, ...batch.filter(profile => !previous.some(old => old.user_id === profile.user_id))]);
            })
            .catch(() => setError('No pudimos cargar más perfiles. Tu elección ya se guardó.'))
            .finally(() => { prefetching.current = false; });
    };

    useEffect(() => {
        if (preferences) void refresh();
        const generationRef = generation;
        return () => { generationRef.current++; };
    }, [preferences, refresh]);

    const swipe = async (direction: 'left' | 'right') => {
        if (busy.current || !profiles[0]) return false;
        busy.current = true;
        setError('');
        const profile = profiles[0];
        const current = generation.current;
        try {
            const result = await postSwipe({ targetUserId: profile.user_id, action: direction === 'right' ? 'LIKE' : 'PASS' }).unwrap();
            const remaining = profiles.slice(1);
            setProfiles(remaining);
            if (result.matched) dispatch(matchesApi.util.invalidateTags(['MatchCelebrations']));
            if (remaining.length <= 3 && current === generation.current) prefetch();
            return true;
        } catch {
            setError('No pudimos guardar tu elección. Intentá de nuevo.');
            return false;
        } finally {
            busy.current = false;
        }
    };

    const restartRound = async () => {
        setError('');
        try {
            const result = await restartPassedProfiles().unwrap();
            if (result.resetCount > 0 || result.newProfilesAvailable) await refresh();
            else setError('No hay perfiles que hayas pasado para revisar con tus preferencias actuales.');
        } catch { setError('No pudimos reiniciar el recorrido. Intentá de nuevo.'); }
    };

    return (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: { md: 520 }, mx: 'auto', height: { xs: 'calc(100dvh - 56px - env(safe-area-inset-bottom))', md: 'calc(100dvh - 64px)' }, minHeight: 420, overflow: 'hidden', bgcolor: '#151515' }}>
            {preferencesError && <Alert severity="error" action={<Button onClick={retryPreferences}>Reintentar</Button>} sx={{ position: 'absolute', zIndex: 10, top: 10, left: 10, right: 10 }}>No pudimos cargar tus preferencias.</Alert>}
            {error && <Alert severity="error" sx={{ position: 'absolute', zIndex: 10, top: 10, left: 10, right: 10 }}>{error}</Alert>}
            {!ready && !preferencesError && <CircularProgress sx={{ position: 'absolute', inset: 0, m: 'auto', color: '#fff' }} />}

            {ready && !profiles.length && (
                <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', px: 3, bgcolor: 'background.default' }}>
                    <Box sx={{ textAlign: 'center', maxWidth: 380 }}>
                        {isFetching || restarting ? <CircularProgress /> : waiting ? <>
                            <Typography variant="h6">Estás al día</Typography>
                            <Typography color="text.secondary" my={2}>Tus perfiles descartados seguirán ocultos. Volvé más tarde para ver personas nuevas.</Typography>
                            <Button onClick={refresh}>Comprobar novedades</Button>
                        </> : <>
                            <Typography variant="h6">No hay más perfiles por el momento</Typography>
                            <Typography color="text.secondary" my={2}>Podés revisar los perfiles que pasaste o esperar a que aparezcan personas nuevas.</Typography>
                            <Stack spacing={1.5}>
                                <Button variant="contained" onClick={restartRound}>Revisar perfiles que pasé</Button>
                                <Button onClick={() => setWaiting(true)}>Esperar perfiles nuevos</Button>
                            </Stack>
                        </>}
                    </Box>
                </Box>
            )}

            {profiles[1] && <SwipeCard key={profiles[1].user_id} profile={profiles[1]} active={false} onSwipe={async () => false} />}
            {profiles[0] && <SwipeCard key={profiles[0].user_id} profile={profiles[0]} active onSwipe={swipe} />}
        </Box>
    );
}
