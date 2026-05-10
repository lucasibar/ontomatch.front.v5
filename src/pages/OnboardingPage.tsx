import { Container, Typography, Box } from '@mui/material';
import { OnboardingStepper } from '../features/onboarding/ui/OnboardingStepper';

export const OnboardingPage = () => {
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box textAlign="center" mb={6}>
                <Typography variant="h3" fontWeight="900" gutterBottom sx={{ letterSpacing: -1 }}>
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
