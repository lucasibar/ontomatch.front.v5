import { useState } from 'react';
import { Box, Button, Typography, Card, CardMedia, IconButton } from '@mui/material';
import { Delete, ArrowBack, ArrowForward } from '@mui/icons-material';
import { useLazyGetSignatureQuery, useAddPhotoMutation, useGetMeQuery, useDeletePhotoMutation, useReorderPhotosMutation } from '../api/profileApi';

export const PhotosStep = () => {
    const { data: profile, isLoading } = useGetMeQuery(undefined);

    if (isLoading) {
        return <Typography>Loading profile...</Typography>;
    }
    const [triggerSignature] = useLazyGetSignatureQuery();
    const [addPhoto] = useAddPhotoMutation();
    const [deletePhoto] = useDeletePhotoMutation();
    const [reorderPhotos] = useReorderPhotosMutation();
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Get Sig
            const sigData = await triggerSignature(null).unwrap() as any;
            if (!sigData) throw new Error("No sig");

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', sigData.apiKey);
            formData.append('timestamp', sigData.timestamp.toString());
            formData.append('signature', sigData.signature);
            formData.append('folder', 'ontomatch/profiles');

            const res = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const cloudData = await res.json();

            // 3. Register with Backend
            await addPhoto({ url: cloudData.secure_url, publicId: cloudData.public_id }).unwrap();
            alert('Photo Uploaded!');
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (photoId: string) => {
        if (sortedPhotos.length <= 3) {
            alert('Debes mantener al menos 3 fotos.');
            return;
        }

        if (confirm('Are you sure you want to delete this photo?')) {
            await deletePhoto(photoId).unwrap();
        }
    };

    const handleMove = async (index: number, direction: 'left' | 'right') => {
        const newPhotos = [...sortedPhotos];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newPhotos.length) return;

        // Swap
        [newPhotos[index], newPhotos[targetIndex]] = [newPhotos[targetIndex], newPhotos[index]];

        // Call API
        const ids = newPhotos.map(p => p.id);
        await reorderPhotos(ids).unwrap();
    };

    const p: any = profile;
    const sortedPhotos = [...(p?.user?.photos || [])].sort((a: any, b: any) => a.position - b.position);

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Mis Fotos ({sortedPhotos.length}/6) {sortedPhotos.length < 3 && <Typography component="span" variant="caption" color="error" sx={{ ml: 1 }}> (Mínimo 3 requeridas)</Typography>}
            </Typography>

            <Box sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                pb: 2,
                px: 2,
                scrollSnapType: 'x mandatory',
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
            }}>
                {sortedPhotos.map((photo: any, index: number) => (
                    <Box key={photo.id} sx={{ minWidth: '120px', width: '30%', flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <Card sx={{
                            position: 'relative',
                            aspectRatio: '9/16',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            <CardMedia
                                component="img"
                                image={photo.url}
                                alt="Profile photo"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            {/* Overlay Controls */}
                            <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                bgcolor: 'rgba(255,255,255,0.85)',
                                backdropFilter: 'blur(4px)',
                                display: 'flex',
                                justifyContent: 'space-around',
                                py: 0.5
                            }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleMove(index, 'left')}
                                    disabled={index === 0}
                                    sx={{ color: '#3A3A3C' }}
                                >
                                    <ArrowBack fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDelete(photo.id)}
                                    color="error"
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleMove(index, 'right')}
                                    disabled={index === sortedPhotos.length - 1}
                                    sx={{ color: '#3A3A3C' }}
                                >
                                    <ArrowForward fontSize="small" />
                                </IconButton>
                            </Box>
                        </Card>
                    </Box>
                ))}

                {/* Upload "Card" */}
                {sortedPhotos.length < 6 && (
                    <Box sx={{ minWidth: '120px', width: '30%', flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <Button
                            component="label"
                            disabled={uploading}
                            sx={{
                                width: '100%',
                                aspectRatio: '9/16',
                                border: '2px dashed #EBEBEB',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                bgcolor: '#FAFAFA',
                                color: '#8E8E93',
                                '&:hover': {
                                    bgcolor: '#F5F5F5',
                                    borderColor: '#3A3A3C',
                                    color: '#3A3A3C'
                                }
                            }}
                        >
                            <Box sx={{ fontSize: 32, fontWeight: 300 }}>+</Box>
                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                {uploading ? '...' : 'Agregar'}
                            </Typography>
                            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );

};
