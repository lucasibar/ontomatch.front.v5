import { useRef, useState } from 'react';
import { animate, motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import type { Profile } from '../types';
import { ImageWithFallback } from '../../../shared/ui/ImageWithFallback';

interface SwipeCardProps {
    profile: Profile;
    onSwipe: (direction: 'left' | 'right') => Promise<boolean>;
    active: boolean;
}

const SwipeCard = ({ profile, onSwipe, active }: SwipeCardProps) => {
    const [photoIndex, setPhotoIndex] = useState(0);
    const leaving = useRef(false);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-320, 320], [-6, 6]);
    const likeOpacity = useTransform(x, [25, 115], [0, 1]);
    const passOpacity = useTransform(x, [-115, -25], [1, 0]);
    const feedbackScale = useTransform(x, [-180, 0, 180], [1.08, 0.82, 1.08]);
    const photos = profile.photos?.length ? profile.photos : [{ url: 'FALLBACK' }];
    const currentPhotoUrl = photos[photoIndex]?.url || 'FALLBACK';

    const commitSwipe = async (direction: 'left' | 'right') => {
        if (leaving.current) return;
        leaving.current = true;
        const destination = (direction === 'right' ? 1 : -1) * Math.max(window.innerWidth * 1.25, 520);
        await animate(x, destination, { duration: 0.22, ease: 'easeOut' });
        const saved = await onSwipe(direction);
        if (!saved) {
            leaving.current = false;
            animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 });
        }
    };

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x > 105 || info.velocity.x > 700) void commitSwipe('right');
        else if (info.offset.x < -105 || info.velocity.x < -700) void commitSwipe('left');
        else animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 });
    };

    const location = profile.neighborhood || profile.locationText || 'Ubicación no indicada';
    const school = profile.coachingSchool || 'Escuela no indicada';

    return (
        <motion.div
            style={{ position: 'absolute', inset: 0, x: active ? x : 0, rotate: active ? rotate : 0, zIndex: active ? 2 : 1, touchAction: 'pan-y' }}
            drag={active ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.72}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
        >
            <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', bgcolor: '#151515', borderRadius: { xs: 0, md: 3 } }}>
                {currentPhotoUrl === 'FALLBACK' ? (
                    <Box sx={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', bgcolor: '#2d2d2d' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,.3)', fontSize: '9rem', fontWeight: 700 }}>{profile.name.charAt(0).toUpperCase()}</Typography>
                    </Box>
                ) : (
                    <ImageWithFallback src={currentPhotoUrl} alt={`${profile.name}, foto ${photoIndex + 1}`} sx={{ pointerEvents: 'none' }} />
                )}

                {photos.length > 1 && (
                    <Box sx={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: 0.5, zIndex: 5 }}>
                        {photos.map((_photo, index) => (
                            <Box key={index} sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: index === photoIndex ? '#fff' : 'rgba(255,255,255,.38)', boxShadow: '0 1px 3px rgba(0,0,0,.24)' }} />
                        ))}
                    </Box>
                )}

                {active && photos.length > 1 && (
                    <>
                        <Box component="button" type="button" aria-label="Foto anterior" onClick={() => setPhotoIndex(index => Math.max(0, index - 1))} sx={{ position: 'absolute', inset: '0 50% 0 0', zIndex: 4, border: 0, p: 0, bgcolor: 'transparent', cursor: photoIndex > 0 ? 'pointer' : 'default' }} />
                        <Box component="button" type="button" aria-label="Foto siguiente" onClick={() => setPhotoIndex(index => Math.min(photos.length - 1, index + 1))} sx={{ position: 'absolute', inset: '0 0 0 50%', zIndex: 4, border: 0, p: 0, bgcolor: 'transparent', cursor: photoIndex < photos.length - 1 ? 'pointer' : 'default' }} />
                    </>
                )}

                {active && (
                    <>
                        <motion.div style={{ position: 'absolute', top: '44%', left: '50%', marginLeft: -29, marginTop: -29, zIndex: 8, opacity: likeOpacity, scale: feedbackScale, pointerEvents: 'none' }}>
                            <Box sx={{ width: 58, height: 58, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', bgcolor: 'rgba(35,105,72,.76)', backdropFilter: 'blur(5px)', boxShadow: '0 4px 18px rgba(0,0,0,.18)' }}><FavoriteRoundedIcon fontSize="medium" /></Box>
                        </motion.div>
                        <motion.div style={{ position: 'absolute', top: '44%', left: '50%', marginLeft: -29, marginTop: -29, zIndex: 8, opacity: passOpacity, scale: feedbackScale, pointerEvents: 'none' }}>
                            <Box sx={{ width: 58, height: 58, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', bgcolor: 'rgba(55,55,58,.76)', backdropFilter: 'blur(5px)', boxShadow: '0 4px 18px rgba(0,0,0,.18)' }}><CloseRoundedIcon fontSize="medium" /></Box>
                        </motion.div>
                    </>
                )}

                <Box sx={{ position: 'absolute', inset: '36% 0 0', zIndex: 3, pointerEvents: 'none', background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.08) 26%, rgba(0,0,0,.72) 100%)' }} />
                <Box sx={{ position: 'absolute', left: 20, right: 20, bottom: 24, zIndex: 5, color: '#fff', pointerEvents: 'none', textShadow: '0 1px 8px rgba(0,0,0,.5)' }}>
                    {photoIndex === 1 ? (
                        <Typography sx={{ color: '#fff', fontSize: '1.08rem', lineHeight: 1.45, fontWeight: 450, maxWidth: 390 }}>{profile.bio}</Typography>
                    ) : (
                        <>
                            <Typography component="h2" sx={{ color: '#fff', fontSize: '1.85rem', lineHeight: 1.1, fontWeight: 650, letterSpacing: '-.02em' }}>{profile.name} {profile.age}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mt: 0.8 }}>
                                {photoIndex === 0 ? <LocationOnRoundedIcon sx={{ fontSize: 18 }} /> : <SchoolRoundedIcon sx={{ fontSize: 18 }} />}
                                <Typography sx={{ color: 'rgba(255,255,255,.92)', fontSize: '.9rem', fontWeight: 450 }}>{photoIndex === 0 ? location : school}</Typography>
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </motion.div>
    );
};

export default SwipeCard;
