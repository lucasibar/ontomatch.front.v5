import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../features/auth/api/authApi';
import { PasswordField } from '../shared/ui/PasswordField';

export const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [register, { isLoading, error }] = useRegisterMutation();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (password.length < 8) {
            setLocalError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('Las contraseñas no coinciden');
            return;
        }

        try {
            await register({ email, password }).unwrap();
            navigate('/verify-email');
        } catch (err) {
            console.error('Failed to register', err);
        }
    };

    const displayError = localError || (error ? ((error as any)?.data?.message || 'Error al registrarse. Probá con otro email.') : '');

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100%',
            p: { xs: 2, sm: 4 },
        }}>
            <Box sx={{ maxWidth: 400, width: '100%' }}>
                <Typography variant="h3" align="center" fontWeight="900"
                    sx={{ mb: 1, letterSpacing: -1, color: 'text.primary' }}
                >
                    OntoMatch
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 5 }}>
                    Citas entre coaches ontológicos
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    {displayError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {displayError}
                        </Alert>
                    )}

                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                    />
                    <PasswordField
                        label="Contraseña"
                        fullWidth
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        helperText="Mínimo 8 caracteres"
                    />
                    <PasswordField
                        label="Confirmar contraseña"
                        fullWidth
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        margin="normal"
                        error={confirmPassword.length > 0 && password !== confirmPassword}
                        helperText={confirmPassword.length > 0 && password !== confirmPassword ? 'Las contraseñas no coinciden' : ''}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isLoading}
                        sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                    >
                        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            ¿Ya tenés cuenta? <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>Iniciar sesión</Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
