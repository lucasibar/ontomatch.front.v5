import { Paper, Typography, Box } from '@mui/material';

// Basic type for MVP
interface Profile {
    user_id: string;
    name: string;
    bio: string; // Make sure backend returns this
    distanceKm?: number;
    photos?: { url: string }[];
}

export const SwipeCard = ({ profile }: { profile: Profile }) => {
    const photoUrl = profile.photos?.[0]?.url || 'https://via.placeholder.com/400x600';

    return (
        <Paper
            elevation={4}
            sx={{
                width: '100%',
                maxWidth: 360,
                height: 500,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                background: `url(${photoUrl}) center/cover no-repeat`,
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    p: 3,
                    color: 'white',
                }}
            >
                <Typography variant="h5" fontWeight="bold">
                    {profile.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {profile.distanceKm ? `${Math.round(profile.distanceKm)} km away` : 'Nearby'}
                </Typography>
                <Typography variant="body1" mt={1}>
                    {profile.bio}
                </Typography>
            </Box>
        </Paper>
    );
};
