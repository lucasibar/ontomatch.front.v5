import { createBrowserRouter, Outlet } from 'react-router-dom';
import { LoginPage, RegisterPage, OnboardingPage, SwipesPage, MatchesPage, ProfilePage, SettingsPage } from '../pages';
import { ProtectedRoute } from '../shared/ui/ProtectedRoute';
import { RequireOnboarding } from '../shared/ui/RequireOnboarding';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    // Protected Routes (require Auth)
    {
        element: <ProtectedRoute><Outlet /></ProtectedRoute>,
        children: [
            {
                path: '/onboarding',
                element: <OnboardingPage />,
            },
            // Routes strictly requiring Onboarding completion
            {
                element: <RequireOnboarding />,
                children: [
                    {
                        path: '/',
                        element: <SwipesPage />,
                    },
                    {
                        path: '/matches',
                        element: <MatchesPage />,
                    },
                    {
                        path: '/profile',
                        element: <ProfilePage />,
                    },
                    {
                        path: '/settings',
                        element: <SettingsPage />,
                    },
                ]
            }
        ]
    },
]);
