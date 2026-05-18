import { Box, BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme } from '@mui/material';
import { Favorite, Person, Style } from '@mui/icons-material'; // Style icon for "Swipes" (cards)
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [value, setValue] = useState(0);

    // Sync state with URL location
    useEffect(() => {
        if (location.pathname === '/' || location.pathname === '/swipes') setValue(0);
        else if (location.pathname === '/matches') setValue(1);
        else if (location.pathname === '/profile') setValue(2);
    }, [location.pathname]);

    const handleNavigation = (newValue: number) => {
        setValue(newValue);
        if (newValue === 0) navigate('/');
        if (newValue === 1) navigate('/matches');
        if (newValue === 2) navigate('/profile');
    };

    return (
        <Box sx={{ pb: isMobile ? 7 : 0, minHeight: '100vh', bgcolor: 'background.default' }}>
            <Outlet />

            {/* Mobile Bottom Navigation */}
            {isMobile ? (
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={(_event, newValue) => handleNavigation(newValue)}
                    >
                        <BottomNavigationAction label="Descubrir" icon={<Style />} />
                        <BottomNavigationAction label="Chats" icon={<Favorite />} />
                        <BottomNavigationAction label="Perfil" icon={<Person />} />
                    </BottomNavigation>
                </Paper>
            ) : (
                /* Desktop Sidenav / Topnav Placeholder - For now using bottom nav style but check requirements later */
                /* User asked for functional approach on desktop if possible. A top bar might be better. */
                <Paper sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={(_event, newValue) => handleNavigation(newValue)}
                    >
                        <BottomNavigationAction label="Descubrir" icon={<Style />} />
                        <BottomNavigationAction label="Chats" icon={<Favorite />} />
                        <BottomNavigationAction label="Perfil" icon={<Person />} />
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    );
};
