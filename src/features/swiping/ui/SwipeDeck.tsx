
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import SwipeCard from './SwipeCard';
import { AnimatePresence } from 'framer-motion';
import { useGetFeedQuery, usePostSwipeMutation } from '../api/swipesApi';
import { type Profile } from '../types';

const SwipeDeck = () => {
    const { data: feed, isLoading, refetch } = useGetFeedQuery({ excludeInactive: true });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [postSwipe] = usePostSwipeMutation();
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        if (feed) {
            if (profiles.length === 0 && feed.length > 0) {
                setProfiles(feed);
                setCurrentIndex(0);
                setFinished(false);
            } else if (feed.length === 0 && profiles.length === 0) {
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

    if (isLoading && profiles.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#111', color: 'white' }}>
            <CircularProgress color="inherit" />
        </Box>;
    }

    if (currentIndex >= profiles.length || finished) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2, bgcolor: '#111', color: 'white' }}>
                <Typography variant="h5">No more profiles nearby.</Typography>
                <Button variant="contained" color="primary" onClick={() => { setProfiles([]); refetch(); }}>
                    Refresh Feed
                </Button>
            </Box>
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
        </Box>
    );
};

export default SwipeDeck;
