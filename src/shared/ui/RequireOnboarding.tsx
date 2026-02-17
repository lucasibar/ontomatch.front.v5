
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '../../features/onboarding/api/profileApi';
import { Box, CircularProgress } from '@mui/material';

export const RequireOnboarding = () => {
    const { data: user, isLoading } = useGetMeQuery(undefined);
    const location = useLocation();

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="background.default">
                <CircularProgress />
            </Box>
        );
    }

    // If user is NOT onboarded OR missing mandatory data, redirect to /onboarding
    // We check for: Flag, Name, Birthdate, Gender, LookingFor, and at least 3 Photos.
    const photoCount = user?.user?.photos?.length || 0;
    const isProfileComplete = user?.isOnboarded &&
        user?.name &&
        user?.birthdate &&
        user?.gender &&
        (user?.looking_for || user?.lookingFor) && // Handle snake/camel case depending on API transform 
        photoCount >= 0;


    if (!isProfileComplete) {
        return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
