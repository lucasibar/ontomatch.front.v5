
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SwipeCard from './SwipeCard';
import { AnimatePresence } from 'framer-motion';
import { useGetFeedQuery, usePostSwipeMutation } from '../api/swipesApi';
import { type Profile } from '../types';
import { AppEmptyState } from '../../../shared/ui/AppEmptyState';

const SwipeDeck = () => {
    const { data: feed, isLoading, isFetching, isError, error, refetch } = useGetFeedQuery({ excludeInactive: true });
    // console.log('SWIPEDECK HOOK STATE:', { isLoading, isFetching, isError, error, feedLength: feed?.length, feed });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [postSwipe] = usePostSwipeMutation();
    const [finished, setFinished] = useState(false);


    useEffect(() => {
        if (feed) {
            // console.log('SwipeDeck useEffect: Syncing feed to profiles', feed.length);
            setProfiles(feed);
            // Only reset index if we are loading a fresh feed
            if (feed.length > 0) {
                // For now, let's just reset everything to be safe
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
                // TODO: Trigger Match Modal globally
                alert("It's a Match!");
            }
        } catch (error) {
            console.error('Swipe failed', error);
        }

    };

    const currentProfile = profiles[currentIndex];
    const nextProfile = profiles[currentIndex + 1];

    // Fix flicker: If feed is loaded but profiles state not yet set, keep showing loader
    const isInitializing = feed && feed.length > 0 && profiles.length === 0;

    if ((isLoading || isInitializing) && profiles.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#111', color: 'white' }}>
            <CircularProgress color="inherit" />
        </Box>;
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

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', bgcolor: '#222' }}>
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

            {/* PERSISTENT ACTION BUTTONS */}
            <Box sx={{
                position: 'absolute',
                bottom: 30,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: 6,
                zIndex: 1000,
                pointerEvents: 'none' // Allow clicks to pass through container
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
                        minWidth: 0, // Override MUI default style
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
                        minWidth: 0, // Override MUI default style
                        '&:hover': { bgcolor: '#e8f5e9' }
                    }}
                >
                    <FavoriteIcon sx={{ fontSize: 32 }} />
                </Button>
            </Box>
        </Box>
    );
};

export default SwipeDeck;
