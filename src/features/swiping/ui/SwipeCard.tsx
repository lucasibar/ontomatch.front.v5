
import React, { useState } from 'react';
import { motion, type PanInfo, useMotionValue, useTransform, animate } from 'framer-motion';
import { Box, Typography, Paper } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import { type Profile } from '../types';
import { ImageWithFallback } from '../../../shared/ui/ImageWithFallback';

interface SwipeCardProps {
    profile: Profile;
    onSwipe: (direction: 'left' | 'right') => void;
    onInfo: () => void;
    active: boolean; // Is top card
}

const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe, onInfo: _onInfo, active }) => {
    const [photoIndex, setPhotoIndex] = useState(0);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-15, 15]);
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const passOpacity = useTransform(x, [-100, 0], [1, 0]);

    const hasPhotos = profile.photos && profile.photos.length > 0;
    const photos = hasPhotos ? profile.photos! : [{ url: 'FALLBACK' }];

    const handleDragEnd = (_: any, info: PanInfo) => {
        const swipeThreshold = 120;

        if (info.offset.x > swipeThreshold) {
            // Swipe Right = LIKE
            animate(x, 500, { duration: 0.3 });
            setTimeout(() => onSwipe('right'), 200);
        } else if (info.offset.x < -swipeThreshold) {
            // Swipe Left = PASS
            animate(x, -500, { duration: 0.3 });
            setTimeout(() => onSwipe('left'), 200);
        } else {
            // Snap back
            animate(x, 0, { duration: 0.3 });
        }
    };

    const handleTapLeft = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPhotoIndex(prev => Math.max(0, prev - 1));
    };

    const handleTapRight = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPhotoIndex(prev => Math.min(photos.length - 1, prev + 1));
    };

    const age = new Date().getFullYear() - new Date(profile.birthdate).getFullYear();

    const currentPhotoUrl = photos[photoIndex]?.url || '';

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
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
        >
            <Paper
                elevation={4}
                sx={{
                    height: '100%',
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: 3, 
                    position: 'relative',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E4E4E7',
                }}
            >
                {/* Image or Fallback */}
                {currentPhotoUrl === 'FALLBACK' || !currentPhotoUrl ? (
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#F4F4F5',
                    }}>
                        <Typography variant="h1" sx={{ color: '#E4E4E7', fontWeight: 700, fontSize: '10rem' }}>
                            {profile.name.charAt(0).toUpperCase()}
                        </Typography>
                    </Box>
                ) : (
                    <ImageWithFallback
                        src={currentPhotoUrl}
                        alt={profile.name}
                        sx={{ pointerEvents: 'none' }}
                    />
                )}

                {/* Tap areas for photo Navigation */}
                {hasPhotos && photos.length > 1 && (
                    <>
                        <Box onClick={handleTapLeft} sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', zIndex: 5, cursor: photoIndex > 0 ? 'pointer' : 'default' }} />
                        <Box onClick={handleTapRight} sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%', zIndex: 5, cursor: photoIndex < photos.length - 1 ? 'pointer' : 'default' }} />
                    </>
                )}

                {/* Photo Indicators - Top Edge */}
                {hasPhotos && photos.length > 1 && (
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

                {/* LIKE / PASS visual feedback overlays */}
                {active && (
                    <>
                        <motion.div style={{
                            position: 'absolute',
                            top: 80,
                            left: 30,
                            opacity: likeOpacity,
                            zIndex: 30,
                            pointerEvents: 'none',
                        }}>
                            <Box sx={{
                                border: '4px solid #4caf50',
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                transform: 'rotate(-20deg)',
                            }}>
                                <Typography sx={{ color: '#4caf50', fontWeight: 900, fontSize: '2rem', letterSpacing: 2 }}>
                                    LIKE
                                </Typography>
                            </Box>
                        </motion.div>
                        <motion.div style={{
                            position: 'absolute',
                            top: 80,
                            right: 30,
                            opacity: passOpacity,
                            zIndex: 30,
                            pointerEvents: 'none',
                        }}>
                            <Box sx={{
                                border: '4px solid #ff4b4b',
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                transform: 'rotate(20deg)',
                            }}>
                                <Typography sx={{ color: '#ff4b4b', fontWeight: 900, fontSize: '2rem', letterSpacing: 2 }}>
                                    NOPE
                                </Typography>
                            </Box>
                        </motion.div>
                    </>
                )}

                {/* INFO OVERLAY - Bottom gradient */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    pt: 12,
                    px: 3,
                    pb: 14,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
                    zIndex: 10,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                }}>
                    <Typography variant="h4" color="white" fontWeight="bold" sx={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)', letterSpacing: 0.5 }}>
                        {profile.name}, {age}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
                        <LocationOnIcon sx={{ color: '#FFFFFF', fontSize: 18 }} />
                        <Typography variant="body2" color="white" sx={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)', fontWeight: 400 }}>
                            {profile.distanceKm ? `A ${Math.round(profile.distanceKm)} km` : (profile as any).locationText || 'Cerca tuyo'}
                        </Typography>
                    </Box>

                    {(profile as any).coachingSchool && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
                            <SchoolIcon sx={{ color: '#FFFFFF', fontSize: 18 }} />
                            <Typography variant="body2" color="white" sx={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)', fontWeight: 400 }}>
                                {(profile as any).coachingSchool || (profile as any).coaching_school}
                            </Typography>
                        </Box>
                    )}

                    {profile.bio && photoIndex >= 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Typography
                                variant="body2"
                                color="white"
                                sx={{
                                    mt: 1.5,
                                    fontWeight: 300,
                                    fontStyle: 'italic',
                                    fontSize: '0.95rem',
                                    lineHeight: 1.4,
                                    textShadow: '0px 1px 3px rgba(0,0,0,0.9)',
                                    opacity: 0.9,
                                    maxHeight: 80,
                                    overflow: 'hidden',
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
