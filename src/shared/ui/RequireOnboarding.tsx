
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
    const u: any = user;
    const photoCount = u?.user?.photos?.length || 0;
    const isProfileComplete = u?.isOnboarded &&
        u?.name &&
        u?.birthdate &&
        u?.gender &&
        (u?.looking_for || u?.lookingFor) && // Handle snake/camel case depending on API transform 
        photoCount >= 1; // Enforce at least 1 photo


    if (!isProfileComplete) {
        return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
