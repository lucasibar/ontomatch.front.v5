import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import SwipeCard from './SwipeCard';
import { useLazyGetFeedQuery, usePostSwipeMutation } from '../api/swipesApi';
import { useGetPreferencesQuery, useUpdatePreferencesMutation } from '../../onboarding/api/profileApi';
import { PreferencesStep } from '../../onboarding/ui/PreferencesStep';
import { GenderPreferences } from '../../onboarding/ui/IdentityStep';
import { PartnerProfileView } from '../../chat/ui/PartnerProfileView';
import type { Profile } from '../types';

export default function SwipeDeck() {
    const navigate = useNavigate();
    const { data: rawPreferences, isError: preferencesError, refetch: retryPreferences } = useGetPreferencesQuery(undefined);
    const preferences = rawPreferences as { ageMin: number; ageMax: number; distanceKm: number; gendersAllowed: string[] } | undefined;
    const [getFeed, { isFetching }] = useLazyGetFeedQuery();
    const [postSwipe] = usePostSwipeMutation();
    const [savePreferences, { isLoading: savingFilters }] = useUpdatePreferencesMutation();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [error, setError] = useState('');
    const [ready, setReady] = useState(false);
    const [sending, setSending] = useState(false);
    const busy = useRef(false);
    const generation = useRef(0);
    const [filters, setFilters] = useState<any>(null);
    const [details, setDetails] = useState<string | null>(null);
    const [match, setMatch] = useState<{ name: string; conversationId?: string } | null>(null);
    const params = {
        limit: 10, excludeInactive: true, minAge: preferences?.ageMin,
        maxAge: preferences?.ageMax, distanceKm: preferences?.distanceKm,
        genders: preferences?.gendersAllowed,
    };

    const refresh = async () => {
        const current = ++generation.current;
        setError('');
        try {
            const result = await getFeed(params).unwrap();
            if (current === generation.current) { setProfiles(result); setReady(true); }
        } catch { if (current === generation.current) { setError('No pudimos cargar los perfiles.'); setReady(true); } }
    };
    useEffect(() => { if (preferences) void refresh(); return () => { generation.current++; }; }, [preferences]);

    const swipe = async (direction: 'left' | 'right') => {
        if (busy.current || !profiles[0]) return;
        busy.current = true;
        setSending(true);
        setError('');
        const profile = profiles[0];
        const current = generation.current;
        try {
            const result = await postSwipe({ targetUserId: profile.user_id, action: direction === 'right' ? 'LIKE' : 'PASS' }).unwrap();
            const remaining = profiles.slice(1);
            setProfiles(remaining);
            if (result.matched) setMatch({ name: profile.name, conversationId: result.conversationId });
            // The swipe is committed before requesting another batch.
            if (remaining.length <= 3) {
                try {
                    const batch = await getFeed(params).unwrap();
                    if (current === generation.current) setProfiles(previous => [...previous, ...batch.filter(p => !previous.some(old => old.user_id === p.user_id))]);
                } catch { setError('No pudimos cargar más perfiles. Tu elección ya se guardó.'); }
            }
        } catch { setError('No pudimos guardar tu elección. Intentá de nuevo.'); }
        finally { busy.current = false; setSending(false); }
    };

    return <Box sx={{ maxWidth: 480, mx: 'auto', px: 1.5, display: 'flex', flexDirection: 'column', height: { xs: 'calc(100dvh - 56px)', md: 'calc(100dvh - 64px)' }, minHeight: 440 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" py={1}>
            <Typography variant="h6">Descubrir</Typography>
            <Button startIcon={<TuneIcon />} disabled={!preferences || sending} onClick={() => { if (preferences) setFilters({ ...preferences, ageRange: [preferences.ageMin, preferences.ageMax] }); }}>Filtros</Button>
        </Stack>
        {preferencesError && <Alert severity="error" action={<Button onClick={retryPreferences}>Reintentar</Button>}>No pudimos cargar tus preferencias.</Alert>}
        {error && <Alert severity="error" action={<Button disabled={sending} onClick={refresh}>Reintentar</Button>}>{error}</Alert>}
        {!ready && !preferencesError && <CircularProgress sx={{ m: 'auto' }} />}
        {ready && !profiles.length && <Box sx={{ m: 'auto', textAlign: 'center' }}>
            {isFetching ? <CircularProgress /> : <><Typography variant="h6">Por ahora no hay más perfiles</Typography><Typography color="text.secondary" my={2}>Podés ajustar los filtros o volver más tarde.</Typography><Button onClick={refresh}>Volver a buscar</Button></>}
        </Box>}
        {profiles[0] && <>
            <Box sx={{ position: 'relative', flex: 1, minHeight: 0, pointerEvents: sending ? 'none' : 'auto' }}>
                {profiles[1] && <SwipeCard key={profiles[1].user_id} profile={profiles[1]} active={false} onSwipe={() => {}} onInfo={() => {}} />}
                <SwipeCard key={profiles[0].user_id} profile={profiles[0]} active onSwipe={swipe} onInfo={() => setDetails(profiles[0].user_id)} />
            </Box>
            <Stack direction="row" justifyContent="center" spacing={2} py={1}>
                <Button disabled={sending} aria-label="Pasar este perfil" onClick={() => swipe('left')} startIcon={<CloseIcon />}>Pasar</Button>
                <Button disabled={sending} onClick={() => setDetails(profiles[0].user_id)}>Ver perfil</Button>
                <Button disabled={sending} variant="contained" onClick={() => swipe('right')} startIcon={<FavoriteIcon />}>Me gusta</Button>
            </Stack>
        </>}
        <PartnerProfileView userId={details} open={!!details} onClose={() => setDetails(null)} onActionSuccess={() => { setProfiles(previous => previous.filter(p => p.user_id !== details)); setDetails(null); }} />
        <Dialog open={!!match} onClose={() => setMatch(null)} maxWidth="xs" fullWidth>
            <DialogTitle>¡Se eligieron!</DialogTitle>
            <DialogContent><Typography>A vos y a {match?.name} les gustaría conocerse. Ya pueden conversar.</Typography></DialogContent>
            <DialogActions><Button onClick={() => setMatch(null)}>Seguir descubriendo</Button><Button variant="contained" onClick={() => navigate(match?.conversationId ? '/matches?conversationId=' + match.conversationId : '/matches')}>Ir al chat</Button></DialogActions>
        </Dialog>
        <Dialog open={!!filters} onClose={() => { if (!savingFilters) setFilters(null); }} maxWidth="xs" fullWidth>
            <DialogTitle>Qué estás buscando</DialogTitle>
            <DialogContent>{filters && <Stack spacing={3} pt={1}>
                <GenderPreferences value={filters.gendersAllowed || []} onChange={value => setFilters({ ...filters, gendersAllowed: value })} />
                <PreferencesStep data={filters} onChange={setFilters} />
            </Stack>}</DialogContent>
            <DialogActions><Button disabled={savingFilters} onClick={() => setFilters(null)}>Cancelar</Button><Button variant="contained" disabled={savingFilters || !filters?.gendersAllowed?.length} onClick={async () => {
                try {
                    await savePreferences({ ageMin: filters.ageRange[0], ageMax: filters.ageRange[1], distanceKm: filters.distanceKm, gendersAllowed: filters.gendersAllowed, gendersAllowedCustom: [] }).unwrap();
                    setFilters(null);
                } catch { setError('No pudimos guardar los filtros.'); }
            }}>{savingFilters ? 'Guardando…' : 'Aplicar filtros'}</Button></DialogActions>
        </Dialog>
    </Box>;
}
