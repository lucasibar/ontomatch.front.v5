import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { store } from '../store';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#3A3A3C', // Soft Charcoal instead of harsh black
        },
        secondary: {
            main: '#8E8E93', // Delicate gray
        },
        background: {
            default: '#FAF9F7', // Warm, very subtle off-white (Cream/Sand)
            paper: '#FFFFFF', // Pure white for cards to float
        },
        text: {
            primary: '#2C2C2E', // Very dark gray, not pure black
            secondary: '#8E8E93',
        },
        divider: '#EBEBEB',
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 500, letterSpacing: '-0.03em', color: '#1C1C1E' },
        h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 500, letterSpacing: '-0.02em', color: '#1C1C1E' },
        h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 400, color: '#2C2C2E' },
        h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 400, color: '#2C2C2E', fontSize: '2rem' },
        h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 400, color: '#2C2C2E' },
        h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 400, color: '#3A3A3C', fontSize: '1.1rem' },
        body1: { fontSize: '0.95rem', fontWeight: 300, color: '#3A3A3C' },
        body2: { fontSize: '0.85rem', fontWeight: 300, color: '#8E8E93' },
        button: { textTransform: 'none', fontWeight: 400, letterSpacing: '0.02em', fontSize: '0.95rem' },
    },
    shape: {
        borderRadius: 16, // Softer curves
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    border: '1px solid #F0F0F0',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)', // Extremely delicate shadow
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12, // Softer button edges
                    padding: '8px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    background: '#3A3A3C',
                    color: '#FFFFFF',
                    '&:hover': {
                        background: '#48484A',
                    }
                },
                outlinedPrimary: {
                    borderColor: '#D1D1D6',
                    color: '#3A3A3C',
                    '&:hover': {
                        borderColor: '#8E8E93',
                        backgroundColor: 'transparent'
                    }
                }
            },
        },
        MuiBottomNavigation: {
            styleOverrides: {
                root: {
                    background: '#FFFFFF',
                    borderTop: '1px solid #F0F0F0',
                }
            }
        }
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
