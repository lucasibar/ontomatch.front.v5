import { useState } from 'react';
import { useLoginMutation } from '../api/authApi';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [login, { isLoading, error }] = useLoginMutation();
    const navigate = useNavigate();

    const isEmailError = (error as any)?.status === 404;
    const isPasswordError = (error as any)?.status === 401;
    const genericError = error && !isEmailError && !isPasswordError;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password }).unwrap();
            navigate('/');
        } catch (err) {
            console.error('Failed to login', err);
        }
    };

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
                    Tu match desde el ser
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    {isEmailError && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            El email no está registrado. <Link to="/register">Crear cuenta</Link>
                        </Alert>
                    )}
                    {genericError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {(error as any)?.data?.message || 'Error de conexión'}
                        </Alert>
                    )}

                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={isEmailError}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={isPasswordError}
                        helperText={isPasswordError ? 'Contraseña incorrecta' : ''}
                    />

                    <Box sx={{ textAlign: 'right', mt: 1, mb: 1 }}>
                        <Typography variant="body2">
                            <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </Typography>
                    </Box>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            ¿No tienes cuenta? <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>Regístrate</Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
