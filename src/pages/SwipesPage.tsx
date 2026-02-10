import { Container, Typography, Box } from '@mui/material';

export const SwipesPage = () => {
    return (
        <Container maxWidth="sm" sx={{ mt: 4, height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Box textAlign="center">
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Espera un ratito
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    los matchs están tomando impulso 🚀
                </Typography>
            </Box>
        </Container>
    );
};
