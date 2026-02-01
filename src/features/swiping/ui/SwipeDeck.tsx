import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useGetFeedQuery, useSwipeMutation, SwipeActionEnum } from '../api/discoveryApi';
import { SwipeCard } from './SwipeCard';

export const SwipeDeck = () => {
    const { data: feed, isLoading, error } = useGetFeedQuery();
    const [swipe] = useSwipeMutation();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleSwipe = async (action: SwipeActionEnum) => {
        if (!feed || !feed[currentIndex]) return;

        const targetUserId = feed[currentIndex].user_id; // Ensure field name matches backend

        // Optimistic: Move to next immediately
        setCurrentIndex((prev) => prev + 1);

        try {
            const result = await swipe({ targetUserId, action }).unwrap();
            if (result.matched) {
                alert("IT'S A MATCH!"); // MVP Alert
            }
        } catch (e) {
            console.error(e);
            // Revert index if failed? For MVP we just keep going
        }
    };

    const navigate = useNavigate();

    useEffect(() => {
        if (error && 'status' in error && error.status === 400) {
            navigate('/onboarding');
        }
    }, [error, navigate]);

    if (isLoading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    if (error) return <Typography color="error">Error loading feed</Typography>;
    if (!feed || currentIndex >= feed.length) return <Typography align="center" mt={4}>No more profiles nearby!</Typography>;

    const currentProfile = feed[currentIndex];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', pt: 4 }}>
            <SwipeCard profile={currentProfile} />

            <Box sx={{ mt: 4, display: 'flex', gap: 4 }}>
                <Button
                    variant="contained"
                    color="error"
                    shape="circle"
                    sx={{ borderRadius: '50%', minWidth: 64, height: 64 }}
                    onClick={() => handleSwipe(SwipeActionEnum.PASS)}
                >
                    <CloseIcon fontSize="large" />
                </Button>

                <Button
                    variant="contained"
                    color="success"
                    sx={{ borderRadius: '50%', minWidth: 64, height: 64 }}
                    onClick={() => handleSwipe(SwipeActionEnum.LIKE)}
                >
                    <FavoriteIcon fontSize="large" />
                </Button>
            </Box>
        </Box>
    );
};
