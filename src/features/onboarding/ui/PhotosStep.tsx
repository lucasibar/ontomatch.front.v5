import { useState } from 'react';
import { Box, Button, Typography, Card, CardMedia, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress } from '@mui/material';
import { Delete, ArrowBack, ArrowForward } from '@mui/icons-material';
import { useLazyGetSignatureQuery, useAddPhotoMutation, useGetMeQuery, useDeletePhotoMutation, useReorderPhotosMutation } from '../api/profileApi';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../shared/model/uiSlice';

export const PhotosStep = () => {
    const { data: profile, isLoading } = useGetMeQuery(undefined);
    const dispatch = useDispatch();

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }
    const [triggerSignature] = useLazyGetSignatureQuery();
    const [addPhoto] = useAddPhotoMutation();
    const [deletePhoto] = useDeletePhotoMutation();
    const [reorderPhotos] = useReorderPhotosMutation();
    const [uploading, setUploading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: size <= 5MB
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            dispatch(showToast({ message: 'La imagen es muy pesada. El tamaño máximo es 5MB.', severity: 'warning' }));
            return;
        }

        // Validation: type must be image
        if (!file.type.startsWith('image/')) {
            dispatch(showToast({ message: 'El archivo seleccionado debe ser una imagen.', severity: 'warning' }));
            return;
        }

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
            dispatch(showToast({ message: '¡Foto subida con éxito! 📸', severity: 'success' }));
        } catch (err) {
            console.error(err);
            dispatch(showToast({ message: 'Error al subir la foto. Intentá de nuevo.', severity: 'error' }));
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteRequest = (photoId: string) => {
        if (sortedPhotos.length <= 3) {
            dispatch(showToast({ message: 'Debes mantener al menos 3 fotos.', severity: 'warning' }));
            return;
        }
        setPhotoToDelete(photoId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!photoToDelete) return;
        try {
            await deletePhoto(photoToDelete).unwrap();
            dispatch(showToast({ message: 'Foto eliminada.', severity: 'info' }));
        } catch (err) {
            dispatch(showToast({ message: 'Error al eliminar la foto.', severity: 'error' }));
        } finally {
            setDeleteDialogOpen(false);
            setPhotoToDelete(null);
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
                                    onClick={() => handleDeleteRequest(photo.id)}
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

                {/* Instant loading placeholder card */}
                {uploading && (
                    <Box sx={{ minWidth: '120px', width: '30%', flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <Card sx={{
                            aspectRatio: '9/16',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                            borderRadius: 2,
                            bgcolor: '#F5F4F0',
                            border: '1px dashed #D1CFC9',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                            gap: 2,
                            p: 1
                        }}>
                            <CircularProgress size={28} thickness={5} />
                            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', textAlign: 'center' }}>
                                Subiendo...
                            </Typography>
                        </Card>
                    </Box>
                )}

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
                                {uploading ? 'Subiendo...' : 'Agregar'}
                            </Typography>
                            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Eliminar foto</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que querés eliminar esta foto?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );

};
