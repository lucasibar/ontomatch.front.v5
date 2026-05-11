import React from 'react';
import { Typography } from '@mui/material';

interface BrandLogoProps {
    size?: 'small' | 'medium' | 'large';
    color?: string | 'primary';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
    size = 'medium',
    color = 'primary'
}) => {
    const fontSize = size === 'small' ? '1.5rem' : size === 'medium' ? '3.5rem' : '5rem';
    const letterSpacing = size === 'large' ? -3 : -1.5;

    const textColor = color === 'primary' ? '#1C1C1E' : color;

    return (
        <Typography
            variant="h4"
            sx={{
                fontWeight: 600, // Softer weight for delicate look
                fontSize: fontSize,
                letterSpacing: letterSpacing,
                textAlign: 'center',
                fontFamily: '"Outfit", "Inter", sans-serif',
                textTransform: 'none',
                lineHeight: 1,
                color: textColor,
            }}
        >
            OntoMatch
        </Typography>
    );
};

