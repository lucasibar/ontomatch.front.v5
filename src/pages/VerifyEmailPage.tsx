import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, TextField, Typography } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import { useResendVerificationMutation, useVerifyEmailMutation } from '../features/auth/api/authApi';
import { markEmailVerified } from '../features/auth/model/authSlice';

export const VerifyEmailPage = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [verifyEmail, { isLoading: isVerifying, error }] = useVerifyEmailMutation();
    const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    if (user?.isEmailVerified !== false) return <Navigate to="/onboarding" replace />;

    const handleVerify = async () => {
        if (!/^\d{6}$/.test(code)) return;
        try {
            await verifyEmail(code).unwrap();
            dispatch(markEmailVerified());
            navigate('/onboarding', { replace: true });
        } catch {
            setMessage('');
        }
    };

    const handleResend = async () => {
        try {
            await resendVerification().unwrap();
            setMessage('Te enviamos un código nuevo. Revisá también la carpeta de spam.');
        } catch {
            setMessage('No pudimos reenviar el código. Intentá nuevamente en unos minutos.');
        }
    };

    return (
        <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
            <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="900" sx={{ mb: 1, letterSpacing: -1 }}>OntoMatch</Typography>
                <Typography variant="h5" fontWeight="700" sx={{ mt: 4, mb: 1 }}>Verificá tu email</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Enviamos un código de 6 dígitos a <b>{user.email}</b>. Ingresalo para empezar a crear tu perfil.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>El código no es válido o venció.</Alert>}
                {message && <Alert severity={message.startsWith('No pudimos') ? 'error' : 'success'} sx={{ mb: 2 }}>{message}</Alert>}

                <TextField
                    autoFocus
                    fullWidth
                    label="Código de verificación"
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                    onKeyDown={(event) => { if (event.key === 'Enter') void handleVerify(); }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={!/^\d{6}$/.test(code) || isVerifying}
                    onClick={handleVerify}
                    sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                >
                    {isVerifying ? <CircularProgress size={24} color="inherit" /> : 'Verificar email'}
                </Button>
                <Button fullWidth disabled={isResending} onClick={handleResend} sx={{ mt: 1.5 }}>
                    {isResending ? 'Reenviando…' : 'Reenviar código'}
                </Button>
            </Box>
        </Container>
    );
};
