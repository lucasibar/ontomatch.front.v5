import { createBrowserRouter } from 'react-router-dom';
import { LoginPage, RegisterPage, OnboardingPage, SwipesPage, MatchesPage, ProfilePage, SettingsPage } from '../pages';
import { ProtectedRoute } from '../shared/ui/ProtectedRoute';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/',
        element: <ProtectedRoute><SwipesPage /></ProtectedRoute>,
    },
    {
        path: '/onboarding',
        element: <ProtectedRoute><OnboardingPage /></ProtectedRoute>,
    },
    {
        path: '/matches',
        element: <ProtectedRoute><MatchesPage /></ProtectedRoute>,
    },
    {
        path: '/profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
    },
    {
        path: '/settings',
        element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
    },
]);
