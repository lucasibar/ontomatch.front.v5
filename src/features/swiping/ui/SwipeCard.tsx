
import React, { useState } from 'react';
import { motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Box, Typography, Paper } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
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
    const rotate = useTransform(x, [-200, 200], [-10, 10]); // Reduced rotation for cleaner feel

    const hasPhotos = profile.photos && profile.photos.length > 0;
    const photos = hasPhotos ? profile.photos! : [{ url: 'FALLBACK' }];

    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x > threshold) {
            // Drag Right -> Previous Photo
            setPhotoIndex(prev => Math.max(0, prev - 1));
        } else if (info.offset.x < -threshold) {
            // Drag Left -> Next Photo
            setPhotoIndex(prev => Math.min(photos.length - 1, prev + 1));
        }
        // Always snap back to center, this is navigation not swipe
    };


    const age = new Date().getFullYear() - new Date(profile.birthdate).getFullYear();

    // Helper to force stability on "random" URLs (e.g. legacy seed data)
    const getStableUrl = (url: string, index: number) => {
        if (!url) return '';
        if (url === 'FALLBACK') return url;
        // If it's already a specific ID, it's fine, but adding a param doesn't hurt.
        // We use the profile ID and photo index as a seed.
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}stable_lock=${profile.user_id}-${index}`;
    };

    const currentPhotoUrl = getStableUrl(photos[photoIndex].url, photoIndex);

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
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
        >
            <Paper
                elevation={4}
                sx={{
                    height: '100%',
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: 0,
                    position: 'relative',
                    bgcolor: 'black'
                }}
            >
                {/* Image or Fallback */}
                {photos[photoIndex].url === 'FALLBACK' ? (
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #444 0%, #222 100%)',
                    }}>
                        <Typography variant="h1" sx={{ color: 'rgba(255,255,255,0.1)', fontWeight: 900, fontSize: '10rem' }}>
                            {profile.name.charAt(0).toUpperCase()}
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        component="img"
                        src={currentPhotoUrl}
                        alt={profile.name}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            pointerEvents: 'none',
                            display: 'block'
                        }}
                    />
                )}

                {/* Tap areas for Navigation (Accessibility / Ease of use) */}
                {hasPhotos && (
                    <>
                        <Box onClick={() => setPhotoIndex(prev => Math.max(0, prev - 1))} sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', zIndex: 1 }} />
                        <Box onClick={() => setPhotoIndex(prev => Math.min(photos.length - 1, prev + 1))} sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%', zIndex: 1 }} />
                    </>
                )}

                {/* Photo Indicators - Top Edge */}
                {hasPhotos && (
                    <Box sx={{ position: 'absolute', top: 8, left: 0, right: 0, display: 'flex', gap: 0.5, px: 1.5, zIndex: 20 }}>
                        {photos.map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    flex: 1,
                                    height: 3,
                                    bgcolor: i === photoIndex ? 'white' : 'rgba(255,255,255,0.3)',
                                    borderRadius: 1,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* INFO OVERLAY: TOP LEFT */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    pt: 6, // Space below bars
                    px: 3,
                    pb: 12, // Gradient fade out
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                    zIndex: 10,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                }}>
                    <Typography variant="h4" color="white" fontWeight="bold" sx={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)', letterSpacing: 0.5 }}>
                        {profile.name}, {age}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <LocationOnIcon sx={{ color: '#ff4b4b', mr: 0.5, fontSize: 18, filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' }} />
                        <Typography variant="body1" color="white" sx={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)', fontWeight: 500 }}>
                            {profile.distanceKm ? `${Math.round(profile.distanceKm)} km away` : 'Nearby'}
                        </Typography>
                    </Box>

                    {/* BIO DISPLAY: Only on Photo #2 (Index 1) */}
                    {photoIndex === 1 && profile.bio && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Typography
                                variant="body1"
                                color="white"
                                sx={{
                                    mt: 2,
                                    fontWeight: 300,
                                    fontStyle: 'italic',
                                    fontSize: '1.1rem',
                                    maxWidth: '90%',
                                    lineHeight: 1.4,
                                    textShadow: '0px 1px 3px rgba(0,0,0,0.9)',
                                    opacity: 0.95
                                }}
                            >
                                "{profile.bio}"
                            </Typography>
                        </motion.div>
                    )}
                </Box>
            </Paper>
        </motion.div>
    );
};

export default SwipeCard;
