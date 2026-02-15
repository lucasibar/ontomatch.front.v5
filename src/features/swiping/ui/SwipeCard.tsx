
import React, { useState } from 'react';
import { motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
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
        : [{ url: 'https://placehold.co/400x600?text=No+Image' }];

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
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                    p: 3,
                    pb: 4,
                    zIndex: 2,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end'
                }}>
                    <Typography variant="h3" color="white" fontWeight="bold" sx={{ textShadow: '0px 2px 4px rgba(0,0,0,0.5)' }}>
                        {profile.name}, {age}
                    </Typography>

                    {/* Subtitle: Neighborhood with Google Maps Icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <LocationOnIcon sx={{ color: '#ff4b4b', mr: 0.5, fontSize: 20, filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }} />
                        <Typography variant="h6" color="white" sx={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>
                            {profile.neighborhood || (profile.distanceKm ? `${Math.round(profile.distanceKm)} km` : 'Nearby')}
                        </Typography>
                    </Box>

                    {/* Bio Helper */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, opacity: 0.8 }}>
                        <InfoIcon sx={{ color: 'white', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="caption" color="white">Swipe down for bio</Typography>
                    </Box>
                </Box>

                {/* Floating Buttons */}
                {active && (
                    <Box sx={{
                        position: 'absolute',
                        bottom: 110, // Higher up, above the text roughly
                        right: 20,
                        display: 'flex',
                        // User said "sobre la imagen van a estar los dos botones".
                        // Let's put them in a Row at the bottom right or center.
                        // "Standard" tinder UI is row at bottom.
                        // Let's keep them as a Row, maybe slightly higher than before to clear the text.
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        width: 'auto',
                        left: 'auto',
                        gap: 2,
                        zIndex: 10
                    }}>
                        <IconButton
                            onClick={() => onSwipe('left')}
                            sx={{
                                bgcolor: 'white',
                                width: 56,
                                height: 56,
                                boxShadow: 3,
                                '&:hover': { bgcolor: '#ffebee' }
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 28, color: '#ff4b4b' }} />
                        </IconButton>

                        <IconButton
                            onClick={() => onSwipe('right')}
                            sx={{
                                bgcolor: 'white',
                                width: 56,
                                height: 56,
                                boxShadow: 3,
                                '&:hover': { bgcolor: '#e8f5e9' }
                            }}
                        >
                            <FavoriteIcon sx={{ fontSize: 28, color: '#4caf50' }} />
                        </IconButton>
                    </Box>
                )}
            </Paper>
        </motion.div>
    );
};

export default SwipeCard;
