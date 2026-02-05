import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useLazyGetSignatureQuery, useAddPhotoMutation } from '../api/profileApi';

export const PhotosStep = () => {
    const [triggerSignature] = useLazyGetSignatureQuery();
    const [addPhoto] = useAddPhotoMutation();
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Get Sig
            const { data: sigData } = await triggerSignature(null).unwrap() as any;
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

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Add your best photos</Typography>
            <Button variant="contained" component="label" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Photo'}
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            {/* List photos here if we fetch my profile */}
        </Box>
    );
};
