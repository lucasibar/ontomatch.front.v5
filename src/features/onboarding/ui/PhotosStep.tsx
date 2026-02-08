import { useState } from 'react';
import { Box, Button, Typography, Grid, Card, CardMedia } from '@mui/material';
import { useLazyGetSignatureQuery, useAddPhotoMutation, useGetMeQuery } from '../api/profileApi';

export const PhotosStep = () => {
    const { data: profile } = useGetMeQuery(undefined);
    const [triggerSignature] = useLazyGetSignatureQuery();
    const [addPhoto] = useAddPhotoMutation();
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
            // console.log("Profile updated:", profile);
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const photos = profile?.user?.photos || [];

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Add your best photos</Typography>
            <Button variant="contained" component="label" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Photo'}
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {photos.map((photo: any) => (
                    <Grid item key={photo.id} xs={6} sm={4} md={3}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="140"
                                image={photo.url}
                                alt="Profile photo"
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
