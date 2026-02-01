import { LoginForm } from '../features/auth/ui/LoginForm';
import { Container } from '@mui/material';

export const LoginPage = () => {
    return (
        <Container maxWidth="sm">
            <LoginForm />
        </Container>
    );
};
