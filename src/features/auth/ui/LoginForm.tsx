import { useState } from 'react';
import { useLoginMutation } from '../api/authApi';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';
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
            console.log('LOGIN ERROR FULL:', err);
            console.error('Failed to login', err);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
            <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
                OntoMatch
            </Typography>
            <Typography variant="body1" gutterBottom align="center" color="text.secondary">
                Welcome back
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 3 }}
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2">
                        Don't have an account? <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>Sign up</Link>
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};
