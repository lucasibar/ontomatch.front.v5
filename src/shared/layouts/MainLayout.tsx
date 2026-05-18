import { Box, BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme } from '@mui/material';
import { Favorite, Person, Style, AdminPanelSettings, BarChart } from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCheckAdminQuery } from '../api/adminApi';

export const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [value, setValue] = useState(0);
    const { data: adminData } = useCheckAdminQuery(undefined);
    const isAdmin = adminData?.isAdmin;

    // Sync state with URL location
    useEffect(() => {
        if (location.pathname === '/' || location.pathname === '/swipes') setValue(0);
        else if (location.pathname === '/matches') setValue(1);
        else if (location.pathname === '/profile') setValue(2);
        else if (location.pathname === '/admin/chats') setValue(3);
        else if (location.pathname === '/admin/metrics') setValue(4);
    }, [location.pathname]);

    const handleNavigation = (newValue: number) => {
        setValue(newValue);
        if (newValue === 0) navigate('/');
        if (newValue === 1) navigate('/matches');
        if (newValue === 2) navigate('/profile');
        if (newValue === 3) navigate('/admin/chats');
        if (newValue === 4) navigate('/admin/metrics');
    };

    return (
        <Box sx={{ pb: isMobile ? 7 : 0, pt: !isMobile ? 8 : 0, minHeight: '100vh', bgcolor: 'background.default' }}>
            <Outlet />

            {/* Mobile Bottom Navigation */}
            {isMobile ? (
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={(_event, newValue) => handleNavigation(newValue)}
                    >
                        <BottomNavigationAction label="Descubrir" icon={<Style />} />
                        <BottomNavigationAction label="Chats" icon={<Favorite />} />
                        <BottomNavigationAction label="Perfil" icon={<Person />} />
                        {isAdmin && <BottomNavigationAction label="Soporte" icon={<AdminPanelSettings />} />}
                        {isAdmin && <BottomNavigationAction label="Métricas" icon={<BarChart />} />}
                    </BottomNavigation>
                </Paper>
            ) : (
                /* Desktop Sidenav / Topnav */
                <Paper sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={(_event, newValue) => handleNavigation(newValue)}
                    >
                        <BottomNavigationAction label="Descubrir" icon={<Style />} />
                        <BottomNavigationAction label="Chats" icon={<Favorite />} />
                        <BottomNavigationAction label="Perfil" icon={<Person />} />
                        {isAdmin && <BottomNavigationAction label="Soporte" icon={<AdminPanelSettings />} />}
                        {isAdmin && <BottomNavigationAction label="Métricas" icon={<BarChart />} />}
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    );
};
