import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogContent, Avatar, Stack, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ForumIcon from '@mui/icons-material/Forum';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import SwipeCard from './SwipeCard';
import { AnimatePresence } from 'framer-motion';
import { useGetFeedQuery, usePostSwipeMutation } from '../api/swipesApi';
import { useGetPreferencesQuery, useGetMeQuery } from '../../onboarding/api/profileApi';
import { type Profile } from '../types';
import { AppEmptyState } from '../../../shared/ui/AppEmptyState';

const SwipeDeck = () => {
    const { data: preferences } = useGetPreferencesQuery(undefined);
    const { data: me } = useGetMeQuery(undefined);

    const prefs: any = preferences;

    const { data: feed, isLoading, refetch } = useGetFeedQuery({
        excludeInactive: true,
        minAge: prefs?.ageMin,
        maxAge: prefs?.ageMax,
        distanceKm: prefs?.distanceKm,
        genders: prefs?.gendersAllowed,
        gendersCustom: prefs?.gendersAllowedCustom
    }, { skip: !preferences });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [postSwipe] = usePostSwipeMutation();
    const [finished, setFinished] = useState(false);

    // Match Popup State
    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [matchedUser, setMatchedUser] = useState<Profile | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);

    useEffect(() => {
        if (feed) {
            setProfiles(feed);
            if (feed.length > 0) {
                setCurrentIndex(0);
                setFinished(false);
            } else {
                setFinished(true);
            }
        }
    }, [feed]);

    const handleSwipe = async (direction: 'left' | 'right') => {
        if (currentIndex >= profiles.length) return;

        const profile = profiles[currentIndex];
        const action = direction === 'right' ? 'LIKE' : 'PASS';

        // Optimistic UI update: Move to next card
        setCurrentIndex(prev => prev + 1);

        try {
            const result = await postSwipe({ targetUserId: profile.user_id, action }).unwrap();
            if (result.matched) {
                console.log("IT'S A MATCH!", result.matchId);
                setMatchedUser(profile);
                setConversationId(result.conversationId || null);
                setMatchModalOpen(true);
            }
        } catch (error) {
            console.error('Swipe failed', error);
        }
    };

    const currentProfile = profiles[currentIndex];
    const nextProfile = profiles[currentIndex + 1];

    const isInitializing = feed && feed.length > 0 && profiles.length === 0;

    if ((isLoading || isInitializing) && profiles.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    const hasReachedEnd = profiles.length > 0 && currentIndex >= profiles.length;

    if (hasReachedEnd || finished) {
        return (
            <AppEmptyState
                title="¡Estás al día!"
                description="Has visto a todos por ahora. ¡Pronto llegarán nuevas caras increíbles!"
                icon={FavoriteIcon}
                actionLabel="Buscar de nuevo"
                onAction={() => { setProfiles([]); refetch(); }}
            />
        );
    }

    // Prepare self avatar photo
    const p: any = me;
    const myPhotos = p?.user?.photos || [];
    const sortedMyPhotos = [...myPhotos].sort((a: any, b: any) => a.position - b.position);
    const mePhoto = sortedMyPhotos.length > 0 ? sortedMyPhotos[0].url : '/logo192.png';

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
            {/* Render Next Card (Inactive, below) */}
            {nextProfile && (
                <SwipeCard
                    key={nextProfile.user_id}
                    profile={nextProfile}
                    active={false}
                    onSwipe={() => { }}
                    onInfo={() => { }}
                />
            )}

            {/* Render Top Card (Active) */}
            {currentProfile && (
                <AnimatePresence>
                    <SwipeCard
                        key={currentProfile.user_id}
                        profile={currentProfile}
                        active={true}
                        onSwipe={handleSwipe}
                        onInfo={() => console.log('Show info')}
                    />
                </AnimatePresence>
            )}

            {/* PERSISTENT ACTION BUTTONS - Only show when we actually have a profile loaded */}
            {currentProfile && (
                <Box sx={{
                    position: 'absolute',
                    bottom: 30,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 6,
                    zIndex: 1000,
                    pointerEvents: 'none'
                }}>
                    {/* Pass Button */}
                    <Button
                        variant="contained"
                        onClick={() => handleSwipe('left')}
                        sx={{
                            width: 70,
                            height: 70,
                            borderRadius: '50%',
                            bgcolor: 'white',
                            color: '#ff4b4b',
                            pointerEvents: 'auto',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                            minWidth: 0,
                            '&:hover': { bgcolor: '#ffebee' }
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 32 }} />
                    </Button>

                    {/* Like Button */}
                    <Button
                        variant="contained"
                        onClick={() => handleSwipe('right')}
                        sx={{
                            width: 70,
                            height: 70,
                            borderRadius: '50%',
                            bgcolor: 'white',
                            color: '#4caf50',
                            pointerEvents: 'auto',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                            minWidth: 0,
                            '&:hover': { bgcolor: '#e8f5e9' }
                        }}
                    >
                        <FavoriteIcon sx={{ fontSize: 32 }} />
                    </Button>
                </Box>
            )}

            {/* Premium real-time Match Popup */}
            <Dialog
                open={matchModalOpen}
                onClose={() => setMatchModalOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        borderRadius: 5,
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        textAlign: 'center',
                        p: 4,
                        position: 'relative'
                    }
                }}
            >
                {/* Close Button */}
                <IconButton
                    onClick={() => setMatchModalOpen(false)}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: 'text.secondary',
                        bgcolor: 'rgba(0,0,0,0.03)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <DialogContent sx={{ p: 0, mt: 1 }}>
                    {/* Glowing Sparkles */}
                    <Box display="flex" justifyContent="center" mb={1.5}>
                        <SparklesIcon sx={{ fontSize: 44, color: '#ea00d9', filter: 'drop-shadow(0 0 10px rgba(234,0,217,0.5))' }} />
                    </Box>

                    <Typography variant="h4" fontWeight={900} sx={{
                        background: 'linear-gradient(135deg, #ea00d9 0%, #711c91 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                    }}>
                        ¡Es un Match!
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, px: 2 }}>
                        Tú y <b>{matchedUser?.name}</b> se han elegido mutuamente desde el ser.
                    </Typography>

                    {/* Photos Container */}
                    <Box display="flex" justifyContent="center" alignItems="center" position="relative" sx={{ mb: 5, height: 120 }}>
                        {/* My Photo */}
                        <Avatar
                            src={mePhoto}
                            sx={{
                                width: 100,
                                height: 100,
                                border: '4px solid white',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                transform: 'rotate(-8deg)',
                                zIndex: 2
                            }}
                        />

                        {/* Heart Icon Pulsing in between */}
                        <Box sx={{
                            position: 'absolute',
                            zIndex: 3,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            bgcolor: '#ea00d9',
                            color: 'white',
                            boxShadow: '0 0 15px rgba(234,0,217,0.5)',
                            animation: 'pulse 1.2s infinite alternate',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '100%': { transform: 'scale(1.15)' }
                            }
                        }}>
                            <FavoriteIcon sx={{ fontSize: 24 }} />
                        </Box>

                        {/* Partner Photo */}
                        <Avatar
                            src={matchedUser?.photos?.[0]?.url || '/logo192.png'}
                            sx={{
                                width: 100,
                                height: 100,
                                border: '4px solid white',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                transform: 'rotate(8deg)',
                                marginLeft: -2,
                                zIndex: 1
                            }}
                        />
                    </Box>

                    {/* Action Buttons */}
                    <Stack spacing={1.5} width="100%">
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<ForumIcon />}
                            onClick={() => {
                                setMatchModalOpen(false);
                                window.location.href = `/matches?conversationId=${conversationId}`;
                            }}
                            sx={{
                                background: 'linear-gradient(135deg, #ea00d9 0%, #711c91 100%)',
                                color: 'white',
                                py: 1.2,
                                borderRadius: 3,
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                boxShadow: '0 8px 20px rgba(234,0,217,0.2)',
                                '&:hover': {
                                    boxShadow: '0 10px 25px rgba(234,0,217,0.35)',
                                    opacity: 0.95
                                }
                            }}
                        >
                            Enviar un mensaje
                        </Button>

                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setMatchModalOpen(false)}
                            sx={{
                                py: 1.2,
                                borderRadius: 3,
                                borderColor: '#E5E5EA',
                                color: '#3A3A3C',
                                fontWeight: 'semibold',
                                '&:hover': {
                                    borderColor: '#3A3A3C',
                                    bgcolor: 'rgba(0,0,0,0.02)'
                                }
                            }}
                        >
                            Seguir buscando
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default SwipeDeck;
