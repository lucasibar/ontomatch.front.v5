import React from 'react';
import { Typography } from '@mui/material';

interface BrandLogoProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
    size = 'medium',
    color = 'white'
}) => {
    const fontSize = size === 'small' ? '1.5rem' : size === 'medium' ? '3.5rem' : '5rem';
    const letterSpacing = size === 'large' ? -3 : -1.5;

    return (
        <Typography
            variant="h4"
            sx={{
                fontWeight: 900,
                fontSize: fontSize,
                letterSpacing: letterSpacing,
                textAlign: 'center',
                color: color,
                textShadow: color === 'white' ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
                fontFamily: '"Outfit", "Inter", sans-serif',
                textTransform: 'none',
                lineHeight: 1
            }}
        >
            OntoMatch
        </Typography>
    );
};
