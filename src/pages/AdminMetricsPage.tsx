import { Box, Container, Grid, Paper, Typography, CircularProgress, Card, CardContent, Divider, Avatar } from '@mui/material';
import { useGetMetricsQuery } from '../shared/api/adminApi';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import BlockIcon from '@mui/icons-material/Block';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const AdminMetricsPage = () => {
    const { data: metrics, isLoading, isError } = useGetMetricsQuery(undefined, {
        pollingInterval: 30000, // Refresh every 30 seconds for live updates
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (isError || !metrics) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default', gap: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.7 }}>Algo salió mal</Typography>
                <Typography variant="body2" sx={{ opacity: 0.5 }}>No pudimos cargar los parámetros de la aplicación.</Typography>
            </Box>
        );
    }

    const { overview, last7days, rates } = metrics;

    const cards = [
        { title: 'Usuarios Registrados', value: overview.totalUsers, icon: <PeopleAltIcon sx={{ color: 'white' }} />, gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' },
        { title: 'Perfiles Completados', value: overview.onboardedProfiles, icon: <CheckCircleOutlineIcon sx={{ color: 'white' }} />, gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
        { title: 'Matches Totales', value: overview.totalMatches, icon: <FavoriteBorderIcon sx={{ color: 'white' }} />, gradient: 'linear-gradient(135deg, #ea00d9 0%, #711c91 100%)' },
        { title: 'Mensajes Enviados', value: overview.totalMessages, icon: <ChatBubbleOutlineIcon sx={{ color: 'white' }} />, gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
        { title: 'Swipes (Interacciones)', value: overview.totalSwipes, icon: <TouchAppIcon sx={{ color: 'white' }} />, gradient: 'linear-gradient(135deg, #8A2387 0%, #E94057 100%)' },
        { title: 'Usuarios Suspendidos', value: overview.suspendedUsers, icon: <BlockIcon sx={{ color: 'white' }} />, gradient: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)' },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F9F8F6', py: 5 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 5, textAlign: 'left' }}>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#111111', letterSpacing: -0.5, mb: 1 }}>
                        Parámetros y Métricas
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Monitoreo en tiempo real de la actividad de los coaches en OntoMatch.
                    </Typography>
                </Box>

                {/* Grid stats */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {cards.map((card, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Card sx={{
                                borderRadius: 4,
                                border: 'none',
                                background: card.gradient,
                                color: 'white',
                                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                                overflow: 'visible',
                                position: 'relative',
                                height: '100%',
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, opacity: 0.9, fontSize: '0.9rem' }}>
                                            {card.title}
                                        </Typography>
                                        <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 44, height: 44 }}>
                                            {card.icon}
                                        </Avatar>
                                    </Box>
                                    <Typography variant="h3" fontWeight="900">
                                        {card.value}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={4}>
                    {/* Activity last 7 days */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', border: '1px solid #EAE9E6' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                                <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
                                    Actividad Reciente (Últimos 7 días)
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body1" fontWeight="600" color="text.primary">Nuevos Usuarios Registrados</Typography>
                                    <Typography variant="h6" fontWeight="900" sx={{ color: 'primary.main' }}>+{last7days.newUsers}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body1" fontWeight="600" color="text.primary">Usuarios Activos</Typography>
                                    <Typography variant="h6" fontWeight="900" sx={{ color: 'success.main' }}>{last7days.activeUsers}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body1" fontWeight="600" color="text.primary">Decisiones de Swipe</Typography>
                                    <Typography variant="h6" fontWeight="900" sx={{ color: 'text.secondary' }}>{last7days.swipes}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body1" fontWeight="600" color="text.primary">Nuevos Matches</Typography>
                                    <Typography variant="h6" fontWeight="900" sx={{ color: 'secondary.main' }}>{last7days.matches}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body1" fontWeight="600" color="text.primary">Mensajes Intercambiados</Typography>
                                    <Typography variant="h6" fontWeight="900" sx={{ color: '#0072ff' }}>{last7days.messages}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Conversion Rates */}
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', border: '1px solid #EAE9E6', height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <SpeedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                                <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
                                    Porcentajes de Conversión
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" fontWeight="700">Tasa de Match (Likes que coinciden)</Typography>
                                        <Typography variant="body2" fontWeight="900" color="primary.main">{rates.matchRate}</Typography>
                                    </Box>
                                    <Box sx={{ height: 8, bgcolor: '#EFEFEF', borderRadius: 4, overflow: 'hidden' }}>
                                        <Box sx={{ width: rates.matchRate, height: '100%', bgcolor: 'primary.main', borderRadius: 4 }} />
                                    </Box>
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" fontWeight="700">Completitud del Onboarding</Typography>
                                        <Typography variant="body2" fontWeight="900" color="success.main">{rates.onboardingCompletion}</Typography>
                                    </Box>
                                    <Box sx={{ height: 8, bgcolor: '#EFEFEF', borderRadius: 4, overflow: 'hidden' }}>
                                        <Box sx={{ width: rates.onboardingCompletion, height: '100%', bgcolor: 'success.main', borderRadius: 4 }} />
                                    </Box>
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" fontWeight="700">Mensajes Promedio por Match</Typography>
                                        <Typography variant="body2" fontWeight="900" color="info.main">{rates.avgMessagesPerMatch}</Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Indica qué tan comprometidos y comunicativos están los usuarios tras hacer match.
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};
