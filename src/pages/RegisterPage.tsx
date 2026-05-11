import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { baseApi } from '../shared/api/baseApi';
import { setCredentials } from '../features/auth/model/authSlice';
import { useDispatch } from 'react-redux';

import { useRegisterMutation } from '../features/auth/api/authApi';

export const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [register, { isLoading, error }] = useRegisterMutation();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register({ email, password }).unwrap();
            navigate('/onboarding');
        } catch (err) {
            console.error('Failed to register', err);
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
                    Únete a la comunidad
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Error al registrarse. Prueba con otro email.
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
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isLoading}
                        sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                    >
                        {isLoading ? 'Creando cuenta...' : 'Registrarse'}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            ¿Ya tienes cuenta? <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>Inicia sesión</Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
