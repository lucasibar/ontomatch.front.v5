import { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showToast } from '../shared/model/uiSlice';
import { useForgotPasswordMutation, useResetPasswordMutation } from '../features/auth/api/authApi';
import { PasswordField } from '../shared/ui/PasswordField';

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
    const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

    const isLoading = isForgotLoading || isResetLoading;

    const handleSendCode = async () => {
        if (!email) return;
        try {
            const normalizedEmail = email.trim().toLowerCase();
            await forgotPassword(normalizedEmail).unwrap();
            setEmail(normalizedEmail);
            setStep(2);
            dispatch(showToast({ message: 'Código enviado. Revisá también spam o correo no deseado.', severity: 'success' }));
        } catch {
            dispatch(showToast({ message: 'No pudimos enviar el código. Intentá nuevamente en unos segundos.', severity: 'error' }));
        }
    };

    const handleReset = async () => {
        if (!/^\d{6}$/.test(code) || newPassword.length < 8 || newPassword.length > 128) return;
        try {
            await resetPassword({ email, code, newPassword }).unwrap();
            dispatch(showToast({ message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.', severity: 'success' }));
            navigate('/login');
        } catch {
            dispatch(showToast({ message: 'Código inválido o error al actualizar', severity: 'error' }));
        }
    };

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: 'background.default'
        }}>
            <Box sx={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="800" sx={{ mb: 1 }}>
                    Recuperar Contraseña
                </Typography>
                
                {step === 1 ? (
                    <>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Ingresa tu correo y te enviaremos un código para restablecer tu contraseña.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleSendCode}
                            disabled={!email || isLoading}
                            sx={{ mb: 2, borderRadius: 3, py: 1.5 }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Enviar código'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Te enviamos un código de 6 dígitos a <b>{email}</b>. Revisá tu bandeja de entrada.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Código de verificación"
                            variant="outlined"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <PasswordField
                            fullWidth
                            label="Nueva contraseña"
                            variant="outlined"
                            helperText="Entre 8 y 128 caracteres" inputProps={{ minLength: 8, maxLength: 128 }} value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleReset}
                            disabled={!/^\d{6}$/.test(code) || newPassword.length < 8 || newPassword.length > 128 || isLoading}
                            sx={{ mb: 2, borderRadius: 3, py: 1.5 }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Actualizar contraseña'}
                        </Button>
                        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                            <Button size="small" onClick={handleSendCode} disabled={isLoading}>
                                Reenviar código
                            </Button>
                            <Button size="small" color="inherit" onClick={() => { setStep(1); setCode(''); }} disabled={isLoading}>
                                Cambiar email
                            </Button>
                        </Box>
                    </>
                )}

                <Button
                    fullWidth
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ color: 'text.secondary' }}
                >
                    Volver al Login
                </Button>
            </Box>
        </Box>
    );
};
