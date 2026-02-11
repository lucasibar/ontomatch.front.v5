
import React, { useState } from 'react';
import { motion, type PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoIcon from '@mui/icons-material/Info';
import { type Profile } from '../types';

interface SwipeCardProps {
    profile: Profile;
    onSwipe: (direction: 'left' | 'right') => void;
    onInfo: () => void;
    active: boolean; // Is top card
}

const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe, onInfo, active }) => {
    const [photoIndex, setPhotoIndex] = useState(0);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);

    const photos = profile.photos && profile.photos.length > 0
        ? profile.photos
        : [{ url: 'https://via.placeholder.com/400x600?text=No+Image' }];

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (Math.abs(info.offset.x) > 100) {
            const direction = info.offset.x > 0 ? 'right' : 'left';
            onSwipe(direction);
        } else if (info.offset.y > 100) {
            onInfo(); // Swipe down for info
        }
    };

    const age = new Date().getFullYear() - new Date(profile.birthdate).getFullYear();

    return (
        <motion.div
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                x: active ? x : 0,
                rotate: active ? rotate : 0,
                zIndex: active ? 100 : 0
            }}
            drag={active ? "x" : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 1.02 }}
        >
            <Paper
                elevation={4}
                sx={{
                    height: '100%',
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: 4,
                    position: 'relative',
                    bgcolor: 'black'
                }}
            >
                {/* Image */}
                <Box
                    component="img"
                    src={photos[photoIndex].url}
                    alt={profile.name}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        pointerEvents: 'none'
                    }}
                />

                {/* Tap areas */}
                <Box onClick={() => setPhotoIndex(prev => Math.max(0, prev - 1))} sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', zIndex: 1 }} />
                <Box onClick={() => setPhotoIndex(prev => Math.min(photos.length - 1, prev + 1))} sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', zIndex: 1 }} />

                {/* Indicators */}
                <Box sx={{ position: 'absolute', top: 10, left: 0, right: 0, display: 'flex', gap: 1, px: 2, zIndex: 2 }}>
                    {photos.map((_, i) => (
                        <Box
                            key={i}
                            sx={{
                                flex: 1,
                                height: 4,
                                bgcolor: i === photoIndex ? 'white' : 'rgba(255,255,255,0.5)',
                                borderRadius: 2
                            }}
                        />
                    ))}
                </Box>

                {/* Info Overlay */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    p: 3,
                    pb: 10,
                    zIndex: 2,
                    pointerEvents: 'none'
                }}>
                    <Typography variant="h3" color="white" fontWeight="bold">
                        {profile.name}, {age}
                    </Typography>
                    <Typography variant="body1" color="white">
                        {profile.distanceKm ? `${Math.round(profile.distanceKm)} km away` : 'Nearby'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, opacity: 0.8 }}>
                        <InfoIcon sx={{ color: 'white', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="caption" color="white">Swipe down for info</Typography>
                    </Box>
                </Box>

                {/* Buttons */}
                {active && (
                    <Box sx={{
                        position: 'absolute',
                        bottom: 20,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 4,
                        zIndex: 10
                    }}>
                        <IconButton
                            onClick={() => onSwipe('left')}
                            sx={{
                                bgcolor: 'white',
                                width: 64,
                                height: 64,
                                boxShadow: 3,
                                '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 32, color: '#ff4b4b' }} />
                        </IconButton>

                        <IconButton
                            onClick={() => onSwipe('right')}
                            sx={{
                                bgcolor: 'white',
                                width: 64,
                                height: 64,
                                boxShadow: 3,
                                '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                        >
                            <FavoriteIcon sx={{ fontSize: 32, color: '#4caf50' }} />
                        </IconButton>
                    </Box>
                )}
            </Paper>
        </motion.div>
    );
};

export default SwipeCard;
