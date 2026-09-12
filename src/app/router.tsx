import { createBrowserRouter, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { MainLayout } from '../shared/layouts/MainLayout';
import { ProtectedRoute } from '../shared/ui/ProtectedRoute';
import { RequireOnboarding } from '../shared/ui/RequireOnboarding';
import { PublicRoute } from '../shared/ui/PublicRoute';
import { RequireVerifiedEmail } from '../shared/ui/RequireVerifiedEmail';
const AdminMetricsPage = lazy(() => import('../pages/AdminMetricsPage').then(m => ({ default: m.AdminMetricsPage })));
const AdminChatsPage = lazy(() => import('../pages/AdminChatsPage').then(m => ({ default: m.AdminChatsPage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const MatchesPage = lazy(() => import('../pages/MatchesPage').then(m => ({ default: m.MatchesPage })));
const SwipesPage = lazy(() => import('../pages/SwipesPage').then(m => ({ default: m.SwipesPage })));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const RegisterPage = lazy(() => import('../pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <PublicRoute><Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><LoginPage /></Suspense></PublicRoute>,
    },
    {
        path: '/register',
        element: <PublicRoute><Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><RegisterPage /></Suspense></PublicRoute>,
    },
    {
        path: '/forgot-password',
        element: <PublicRoute><Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><ForgotPasswordPage /></Suspense></PublicRoute>,
    },
    // Protected Routes (require Auth)
    {
        element: <ProtectedRoute><Outlet /></ProtectedRoute>,
        children: [
            {
                path: '/verify-email',
                element: <Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><VerifyEmailPage /></Suspense>,
            },
            {
                element: <RequireVerifiedEmail />,
                children: [
                    {
                        path: '/onboarding',
                        element: <Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><OnboardingPage /></Suspense>,
                    },
                    // Routes strictly requiring Onboarding completion
                    {
                        element: <RequireOnboarding />,
                        children: [
                            {
                                element: <MainLayout />,
                                children: [
                                    { index: true, element: <Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><SwipesPage /></Suspense> },
                                    { path: '/swipes', element: <Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><SwipesPage /></Suspense> },
                                    { path: '/matches', element: <Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><MatchesPage /></Suspense> },
                                    { path: '/chat', element: <Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><MatchesPage /></Suspense> },
                                    { path: '/profile', element: <Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><ProfilePage /></Suspense> },
                                    { path: '/admin/chats', element: <Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><AdminChatsPage /></Suspense> },
                                    { path: '/admin/metrics', element: <Suspense fallback={<div role="status" style={{ padding: 24 }}>Cargando…</div>}><AdminMetricsPage /></Suspense> },
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
]);
