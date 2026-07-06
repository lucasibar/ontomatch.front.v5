import React, { useState } from 'react';
import { Box, Skeleton, type BoxProps } from '@mui/material';

interface ImageWithFallbackProps extends BoxProps {
    src: string;
    alt: string;
    cloudinaryTransform?: string; // e.g. "w_600,c_fill,q_auto,f_auto"
}

export const getOptimizedCloudinaryUrl = (url: string, transform = 'w_800,c_fill,q_auto,f_auto') => {
    if (!url) return '';
    if (url.includes('cloudinary.com') && !url.includes('/upload/w_') && !url.includes('/upload/q_')) {
        // Insert transformation after /upload/
        return url.replace('/upload/', `/upload/${transform}/`);
    }
    return url;
};

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, cloudinaryTransform = 'w_800,c_fill,q_auto,f_auto', sx, ...props }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    const optimizedSrc = getOptimizedCloudinaryUrl(src, cloudinaryTransform);

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%', ...sx }} {...props}>
            {!loaded && !error && (
                <Skeleton 
                    variant="rectangular" 
                    width="100%" 
                    height="100%" 
                    animation="wave" 
                    sx={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                />
            )}
            
            <Box
                component="img"
                src={optimizedSrc}
                alt={alt}
                onLoad={() => setLoaded(true)}
                onError={() => {
                    setError(true);
                    setLoaded(true);
                }}
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                    ...(error ? { display: 'none' } : {})
                }}
            />

            {error && (
                <Box sx={{ 
                    width: '100%', height: '100%', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', 
                    bgcolor: 'grey.200', color: 'grey.500' 
                }}>
                    Error al cargar imagen
                </Box>
            )}
        </Box>
    );
};
