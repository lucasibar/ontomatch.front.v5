import { createBrowserRouter, Outlet } from 'react-router-dom';
import { LoginPage, RegisterPage, ForgotPasswordPage, OnboardingPage, SwipesPage, MatchesPage, ProfilePage, SettingsPage } from '../pages';
import { MainLayout } from '../shared/layouts/MainLayout';
import { ProtectedRoute } from '../shared/ui/ProtectedRoute';
import { RequireOnboarding } from '../shared/ui/RequireOnboarding';
import { PublicRoute } from '../shared/ui/PublicRoute';


export const router = createBrowserRouter([
    {
        path: '/login',
        element: <PublicRoute><LoginPage /></PublicRoute>,
    },
    {
        path: '/register',
        element: <PublicRoute><RegisterPage /></PublicRoute>,
    },
    {
        path: '/forgot-password',
        element: <PublicRoute><ForgotPasswordPage /></PublicRoute>,
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
                        element: <MainLayout />,
                        children: [
                            {
                                index: true,
                                element: <SwipesPage />,
                            },
                            {
                                path: '/swipes',
                                element: <SwipesPage />,
                            },
                            {
                                path: '/matches',
                                element: <MatchesPage />,
                            },
                            {
                                path: '/chat',
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
            }
        ]
    },
]);
