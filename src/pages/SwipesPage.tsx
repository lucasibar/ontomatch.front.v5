import { Container, Typography, Box } from '@mui/material';
import { SwipeDeck } from '../features/swiping/ui/SwipeDeck';

export const SwipesPage = () => {
    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Box mb={2} textAlign="center">
                <Typography variant="h4" fontWeight="bold">Swipes</Typography>
                <Typography variant="subtitle1" color="text.secondary">Descubrí gente cerca de vos</Typography>
            </Box>
            <SwipeDeck />
        </Container>
    );
};
