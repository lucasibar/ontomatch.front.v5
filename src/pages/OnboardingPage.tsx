import { Container, Typography, Box, Button } from '@mui/material';
import { OnboardingStepper } from '../features/onboarding/ui/OnboardingStepper';
import { Navigate } from 'react-router-dom';
import { useGetMeQuery } from '../features/onboarding/api/profileApi';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/model/authSlice';
import type { AppDispatch } from '../app/store';

export const OnboardingPage = () => {
    const { data: profile, isLoading, isFetching } = useGetMeQuery(undefined);
    const dispatch = useDispatch<AppDispatch>();
    const hasCompletedOnboarding = typeof profile === 'object'
        && profile !== null
        && 'isOnboarded' in profile
        && profile.isOnboarded === true;

    if (!isLoading && !isFetching && hasCompletedOnboarding) {
        return <Navigate to="/" replace />;
    }

    return (
        <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 1.5, sm: 3 }, overflowX: 'clip' }}>
            <Button
                size="small"
                color="inherit"
                onClick={() => dispatch(logout())}
                sx={{
                    position: 'fixed',
                    top: 'calc(10px + env(safe-area-inset-top))',
                    right: 'calc(10px + env(safe-area-inset-right))',
                    zIndex: 10,
                    minWidth: 0,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    color: 'text.secondary',
                    bgcolor: 'rgba(250, 249, 247, 0.88)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': { bgcolor: 'rgba(250, 249, 247, 1)' },
                }}
            >
                Salir
            </Button>
            <Box textAlign="center" mb={{ xs: 3, sm: 6 }} sx={{ px: 5 }}>
                <Typography variant="h3" fontWeight="900" gutterBottom sx={{ letterSpacing: -1, fontSize: { xs: '2rem', sm: '3rem' } }}>
                    OntoMatch
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Vamos a crear tu perfil para encontrar tu match ideal.
                </Typography>
            </Box>
            <OnboardingStepper />
        </Container>
    );
};
