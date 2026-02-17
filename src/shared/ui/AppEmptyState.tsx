import React, { ElementType } from 'react';
import { Box, Typography, Button, keyframes } from '@mui/material';

// Define a subtle pulse animation
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

interface AppEmptyStateProps {
    title: string;
    description: string;
    icon?: ElementType;
    actionLabel?: string;
    onAction?: () => void;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
    title,
    description,
    icon: Icon,
    actionLabel,
    onAction
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                bgcolor: '#111',
                color: 'white',
                gap: 3,
                textAlign: 'center',
                p: 4
            }}
        >
            {Icon && (
                <Box sx={{ animation: `${pulse} 3s infinite ease-in-out` }}>
                    <Icon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.9 }} />
                </Box>
            )}

            <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
                    {description}
                </Typography>
            </Box>

            {actionLabel && onAction && (
                <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    onClick={onAction}
                    sx={{
                        borderRadius: 50,
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(255, 105, 180, 0.3)' // Pinkish shadow match primary
                    }}
                >
                    {actionLabel}
                </Button>
            )}
        </Box>
    );
};
