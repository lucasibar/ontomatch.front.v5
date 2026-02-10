import { Box, Typography, Container } from '@mui/material';

export const MatchesPage = () => {
    return (
        <Container maxWidth="sm" sx={{ mt: 4, height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box textAlign="center">
                <Typography variant="h6" color="text.secondary">
                    Tus conexiones aparecerán aquí ❤️
                </Typography>
            </Box>
        </Container>
    );
};
