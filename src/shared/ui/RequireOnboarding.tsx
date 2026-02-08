
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '../../features/onboarding/api/profileApi';
import { Box, CircularProgress } from '@mui/material';

export const RequireOnboarding = () => {
    const { data: user, isLoading, error } = useGetMeQuery(undefined);
    const location = useLocation();
    console.log('RequireOnboarding State:', { isLoading, user, error });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // If user is NOT onboarded, redirect to /onboarding
    if (!user?.isOnboarded) {
        return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
