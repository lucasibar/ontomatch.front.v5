import React, { useState } from 'react';
import {
    Box,
    Typography,
    Modal,
    IconButton,
    CircularProgress,
    Divider,
    Button,
    Paper,
    Stack,
    Chip,
    Fade,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import HeightIcon from '@mui/icons-material/Height';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import { useGetProfileByIdQuery } from '../../onboarding/api/profileApi';

interface PartnerProfileViewProps {
    userId: string | null;
    open: boolean;
    onClose: () => void;
}

const MotionImg = motion.img;

interface Profile {
    name: string;
    birthdate: string;
    gender: string;
    bio: string;
    looking_for: string;
    height?: number;
    locationText?: string;
    neighborhood?: string;
    coachingSchool?: string;
    photos: { url: string }[];
}

export const PartnerProfileView: React.FC<PartnerProfileViewProps> = ({ userId, open, onClose }) => {
    const { data, isLoading, isError } = useGetProfileByIdQuery(userId as string, {
        skip: !userId,
    });
    const profile = data as Profile | undefined;
    const [photoIndex, setPhotoIndex] = useState(0);

    if (isLoading) {
        return (
            <Modal open={open} onClose={onClose}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', outline: 'none' }}>
                    <CircularProgress sx={{ color: '#ff42de' }} />
                </Box>
            </Modal>
        );
    }

    if (isError || !profile) {
        return (
            <Modal open={open} onClose={onClose}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 4, textAlign: 'center', boxShadow: 24 }}>
                    <Typography color="error" variant="h6">¡Ups! Algo salió mal</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No pudimos cargar el perfil.</Typography>
                    <Button onClick={onClose} sx={{ mt: 2 }}>Cerrar</Button>
                </Box>
            </Modal>
        );
    }

    const age = new Date().getFullYear() - new Date(profile.birthdate).getFullYear();
    const photos = profile.photos || [];

    const handleNextPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrevPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const getLookingForLabel = (value: string) => {
        const labels: Record<string, string> = {
            'sessions_1_on_1': 'Sesiones 1 a 1',
            'networking': 'Networking profesional',
            'relationship': 'Pareja',
            'casual': 'Algo casual'
        };
        return labels[value] || value;
    };

    const getGenderLabel = (value: string) => {
        const labels: Record<string, string> = {
            'male': 'Hombre',
            'female': 'Mujer',
            'non_binary': 'No Binario',
            'other': 'Otro'
        };
        return labels[value] || value;
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3000,
                backdropFilter: 'blur(8px)',
                bgcolor: 'rgba(0,0,0,0.4)'
            }}
        >
            <Fade in={open}>
                <Paper sx={{
                    width: { xs: '100%', sm: 480 },
                    height: { xs: '100%', sm: '92vh' },
                    maxHeight: { xs: '100%', sm: 850 },
                    overflow: 'hidden',
                    borderRadius: { xs: 0, sm: 6 },
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    bgcolor: 'background.default',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    outline: 'none'
                }}>
                    {/* Header Controls - Floating (Independent of scroll) */}
                    <Box sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        right: 20,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        zIndex: 25,
                        pointerEvents: 'none'
                    }}>
                        <Box sx={{
                            px: 1.5,
                            py: 0.5,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 10,
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(255,255,255,0.1)',
                            pointerEvents: 'auto'
                        }}>
                            {photoIndex + 1} / {photos.length}
                        </Box>

                        <IconButton
                            onClick={onClose}
                            sx={{
                                bgcolor: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                                pointerEvents: 'auto',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Scrollable Content */}
                    <Box sx={{ flex: 1, overflowY: 'auto', scrollBehavior: 'smooth' }}>
                        {/* Gallery Section - Full Screen by default */}
                        <Box sx={{ height: '100%', position: 'relative', bgcolor: 'black', overflow: 'hidden' }}>
                            <AnimatePresence mode="wait">
                                <MotionImg
                                    key={photoIndex}
                                    src={photos[photoIndex]?.url}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </AnimatePresence>

                            {/* Navigation Overlays */}
                            {photos.length > 1 && (
                                <>
                                    <Box onClick={handlePrevPhoto} sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', zIndex: 5, cursor: 'pointer' }} />
                                    <Box onClick={handleNextPhoto} sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%', zIndex: 5, cursor: 'pointer' }} />

                                    <IconButton
                                        onClick={handlePrevPhoto}
                                        disabled={photoIndex === 0}
                                        sx={{
                                            position: 'absolute',
                                            left: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 6,
                                            color: 'white',
                                            bgcolor: 'rgba(0,0,0,0.2)',
                                            backdropFilter: 'blur(4px)',
                                            '&:disabled': { opacity: 0 }
                                        }}
                                    >
                                        <ArrowBackIosNewIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        onClick={handleNextPhoto}
                                        disabled={photoIndex === photos.length - 1}
                                        sx={{
                                            position: 'absolute',
                                            right: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 6,
                                            color: 'white',
                                            bgcolor: 'rgba(0,0,0,0.2)',
                                            backdropFilter: 'blur(4px)',
                                            '&:disabled': { opacity: 0 }
                                        }}
                                    >
                                        <ArrowForwardIosIcon fontSize="small" />
                                    </IconButton>
                                </>
                            )}
                        </Box>

                        {/* Details Container - Content below the initial viewport */}
                        <Box sx={{ p: 4, bgcolor: 'background.default' }}>
                            {/* Primary Info (Moved from photo overlay) */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: -1, color: 'text.primary' }}>
                                    {profile.name}, {age} años
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                    <LocationOnIcon sx={{ color: '#ff4b4b', fontSize: 20 }} />
                                    <Typography variant="body1" fontWeight="bold" color="text.secondary">
                                        {profile.locationText || 'Cerca de ti'} {profile.neighborhood ? `• ${profile.neighborhood}` : ''}
                                    </Typography>
                                </Stack>
                                {profile.coachingSchool && (
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                        <SchoolIcon sx={{ color: '#7000ff', fontSize: 20 }} />
                                        <Typography variant="body1" fontWeight="bold" color="primary.main">
                                            {profile.coachingSchool}
                                        </Typography>
                                    </Stack>
                                )}
                            </Box>

                            {profile.bio && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" fontWeight="800" gutterBottom sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 4, height: 20, bgcolor: '#ff42de', borderRadius: 4 }} />
                                        Sobre mí
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        color: 'text.secondary',
                                        lineHeight: 1.6,
                                        fontSize: '1.05rem',
                                        bgcolor: 'rgba(0,0,0,0.02)',
                                        p: 2,
                                        borderRadius: 3,
                                        border: '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                        {profile.bio}
                                    </Typography>
                                </Box>
                            )}

                            <Typography variant="h6" fontWeight="800" sx={{ mb: 2, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 4, height: 20, bgcolor: '#7000ff', borderRadius: 4 }} />
                                Detalles
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                                <Chip icon={<PersonIcon />} label={getGenderLabel(profile.gender)} sx={{ borderRadius: 2, fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)' }} />
                                {profile.height && (
                                    <Chip icon={<HeightIcon />} label={`${profile.height} cm`} sx={{ borderRadius: 2, fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)' }} />
                                )}
                                <Chip icon={<SearchIcon />} label={getLookingForLabel(profile.looking_for)} sx={{ borderRadius: 2, fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)' }} />
                                {profile.coachingSchool && (
                                    <Chip icon={<SchoolIcon />} label={profile.coachingSchool} sx={{ borderRadius: 2, fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)' }} />
                                )}
                            </Box>

                            <Divider sx={{ my: 4, opacity: 0.5 }} />

                            {/* Safety Actions */}
                            <Stack spacing={2} sx={{ mb: 4 }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<BlockIcon />}
                                    fullWidth
                                    sx={{
                                        borderRadius: 3,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        borderWidth: 2,
                                        '&:hover': { borderWidth: 2 }
                                    }}
                                >
                                    Bloquear a {profile.name}
                                </Button>
                                <Button
                                    variant="text"
                                    color="error"
                                    startIcon={<ReportProblemIcon />}
                                    fullWidth
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        opacity: 0.8
                                    }}
                                >
                                    Reportar cuenta
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </Paper>
            </Fade>
        </Modal>
    );
};
