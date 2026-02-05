import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { baseApi } from '../shared/api/baseApi';

// Define register endpoint here manually or update authApi. 
// For speed let's just inject endpoint here or update authApi next.
export const extendedAuthApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation<{ access_token: string }, any>({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err) { }
            },
        }),
    }),
});

const { useRegisterMutation } = extendedAuthApi;
import { setCredentials } from '../features/auth/model/authSlice';
import { useDispatch } from 'react-redux';

export const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [register, { isLoading, error }] = useRegisterMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await register({ email, password }).unwrap();
            // Auto login logic
            dispatch(setCredentials({ user: { email }, token: result.access_token }));
            navigate('/onboarding');
        } catch (err) {
            console.error('Failed to register', err);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', height: '100vh' }}>
            <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Join OntoMatch
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {error && (
                            <Typography color="error" variant="body2">
                                Registration failed. Try a different email.
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            disabled={isLoading}
                            sx={{ mt: 2 }}
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2">
                                Already have an account? <Link to="/login">Login</Link>
                            </Typography>
                        </Box>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};
