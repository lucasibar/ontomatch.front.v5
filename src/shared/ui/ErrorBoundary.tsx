import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useRouteError } from 'react-router-dom';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', p: 3, bgcolor: 'background.default' }}>
                    <WarningAmberIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        Ups, algo se rompió.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
                        Ocurrió un error inesperado en la aplicación. Por favor, recarga la página para continuar.
                    </Typography>
                    <Button variant="contained" onClick={() => window.location.reload()} size="large">
                        Recargar página
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export function RouteErrorFallback() {
    const error = useRouteError();

    console.error('Route error:', error);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', textAlign: 'center', p: 3, bgcolor: 'background.default' }}>
            <WarningAmberIcon sx={{ fontSize: 52, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
                Hay una actualización disponible
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                Actualizá la aplicación para continuar. Tu cuenta y tus conversaciones están seguras.
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()} size="large">
                Actualizar aplicación
            </Button>
        </Box>
    );
}
