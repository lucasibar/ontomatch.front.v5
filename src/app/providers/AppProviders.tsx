import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { store } from '../store';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#E91E63', // Modern Pink/Red for dating
        },
        secondary: {
            main: '#7C4DFF',
        },
        background: {
            default: '#FDFCFE', // Premium Off-White
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1A1A1A',
            secondary: '#666666',
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 16,
    },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </Provider>
    );
}
