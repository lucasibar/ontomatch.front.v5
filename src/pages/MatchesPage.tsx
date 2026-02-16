
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Paper, CircularProgress, Container } from '@mui/material';
import { useGetMatchesQuery } from '../features/matches/api/matchesApi';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

export const MatchesPage = () => {
    const { data: matches, isLoading, isError, error } = useGetMatchesQuery();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#111' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#111', color: 'white', gap: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.7 }}>Recién empezando?</Typography>
                <Typography variant="body2" sx={{ opacity: 0.5 }}>Vamos para adelante! (Error cargando coincidencias)</Typography>
            </Box>
        );
    }

    if (!matches || matches.length === 0) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#111', color: 'white', gap: 2 }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 60, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ opacity: 0.7 }}>Recién empezando?</Typography>
                <Typography variant="body2" sx={{ opacity: 0.5 }}>Vamos para adelante! Sigue dando likes.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#111', color: 'white', pb: 10 }}>
            <Container maxWidth="sm" sx={{ pt: 4 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, px: 2 }}>Matches</Typography>

                <Grid container spacing={2} sx={{ px: 2 }}>
                    {matches.map((match) => (
                        <Grid item xs={6} sm={4} key={match.id}>
                            <Paper
                                sx={{
                                    bgcolor: '#222',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    aspectRatio: '3/4',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.02)' }
                                }}
                                elevation={2}
                                onClick={() => navigate('/chat', { state: { conversationId: match.conversationId } })}
                            >
                                {match.partner.photoUrl ? (
                                    <Box
                                        component="img"
                                        src={match.partner.photoUrl}
                                        alt={match.partner.name}
                                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#333' }}>
                                        <Typography variant="h3" fontWeight="bold" sx={{ opacity: 0.3 }}>
                                            {match.partner.name.charAt(0).toUpperCase()}
                                        </Typography>
                                    </Box>
                                )}

                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                    p: 2,
                                    pt: 4
                                }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {match.partner.name}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};
