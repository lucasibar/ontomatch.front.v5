import { useState } from 'react';
import { Box, Button, Typography, Grid, Card, CardMedia, IconButton } from '@mui/material';
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

    const sortedPhotos = [...(profile?.user?.photos || [])].sort((a: any, b: any) => a.position - b.position);

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Add your best photos</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
                Photos: {sortedPhotos.length} / 6 {sortedPhotos.length < 3 && "(Minimum 3 required)"}
            </Typography>

            {sortedPhotos.length < 3 && (
                <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                    You need at least 3 photos to continue.
                </Typography>
            )}

            <Button variant="contained" component="label" disabled={uploading || sortedPhotos.length >= 6}>
                {uploading ? 'Uploading...' : 'Upload Photo'}
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {sortedPhotos.map((photo: any, index: number) => (
                    <Grid item key={photo.id} xs={6} sm={4} md={3}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="140"
                                image={photo.url}
                                alt="Profile photo"
                            />
                            <Box display="flex" justifyContent="center" p={1}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleMove(index, 'left')}
                                    disabled={index === 0}
                                >
                                    <ArrowBack />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDelete(photo.id)}
                                    color="error"
                                >
                                    <Delete />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleMove(index, 'right')}
                                    disabled={index === sortedPhotos.length - 1}
                                >
                                    <ArrowForward />
                                </IconButton>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
