import { Box, Typography, Container, TextField, Button, MenuItem, FormControl, InputLabel, Select, Snackbar, Alert } from '@mui/material';
import { useGetMeQuery, useUpdateProfileMutation } from '../features/onboarding/api/profileApi';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/model/authSlice';
import { PhotosStep } from '../features/onboarding/ui/PhotosStep';

export const ProfilePage = () => {
    const dispatch = useDispatch();
    const { data: profile, isLoading } = useGetMeQuery(undefined);
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [formData, setFormData] = useState<any>({});
    const [toast, setToast] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                bio: profile.bio,
                birthdate: profile.birthdate, // Format YYYY-MM-DD
                gender: profile.gender,
                lookingFor: profile.looking_for, // API returns snake_case usually, check Profile entity
                height: profile.height,
                locationText: profile.locationText,
                neighborhood: profile.neighborhood,
                // Add lookingFor if not already there
            });
        }
    }, [profile]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Validation
        const required = ['name', 'bio', 'birthdate', 'gender', 'lookingFor', 'locationText'];
        const missing = required.filter(field => !formData[field]);

        if (missing.length > 0) {
            setToast({ open: true, message: `Faltan completar campos obligatorios: ${missing.join(', ')}`, severity: 'error' });
            return;
        }

        try {
            await updateProfile(formData).unwrap();
            setToast({ open: true, message: 'Perfil actualizado', severity: 'success' });
        } catch (error) {
            setToast({ open: true, message: 'Error al actualizar', severity: 'error' });
        }
    };

    if (isLoading) return <Typography>Cargando perfil...</Typography>;

    return (
        <Container maxWidth="sm" sx={{ pb: 10, pt: 2 }}>
            <Typography variant="h4" fontWeight="bold" mb={3}>Mi Perfil</Typography>

            {/* Reuse Photos Component - It handles its own state/API */}
            <Typography variant="h6" mb={1}>Fotos</Typography>
            <PhotosStep />

            <Box component="form" display="flex" flexDirection="column" gap={3} mt={4}>
                <Typography variant="h6">Información Personal</Typography>

                <TextField
                    label="Nombre"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Bio"
                    multiline
                    rows={3}
                    value={formData.bio || ''}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Fecha de Nacimiento"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.birthdate ? formData.birthdate.split('T')[0] : ''}
                    onChange={(e) => handleChange('birthdate', e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Altura (cm)"
                    type="number"
                    value={formData.height || ''}
                    onChange={(e) => handleChange('height', parseInt(e.target.value))}
                    fullWidth
                />

                <FormControl fullWidth>
                    <InputLabel>Género</InputLabel>
                    <Select
                        value={formData.gender || ''}
                        label="Género"
                        onChange={(e) => handleChange('gender', e.target.value)}
                    >
                        <MenuItem value="male">Hombre</MenuItem>
                        <MenuItem value="female">Mujer</MenuItem>
                        <MenuItem value="non_binary">No Binario</MenuItem>
                        <MenuItem value="other">Otro</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>¿Qué buscas?</InputLabel>
                    <Select
                        value={formData.lookingFor || ''}
                        label="¿Qué buscas?"
                        onChange={(e) => handleChange('lookingFor', e.target.value)}
                    >
                        <MenuItem value="sessions_1_on_1">Sesiones 1 a 1</MenuItem>
                        <MenuItem value="networking">Networking profesional</MenuItem>
                        <MenuItem value="relationship">Pareja</MenuItem>
                        <MenuItem value="casual">Algo casual</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Ubicación (Texto)"
                    value={formData.locationText || ''}
                    onChange={(e) => handleChange('locationText', e.target.value)}
                    fullWidth
                    helperText="Pronto mejoraremos la selección de mapa para edición"
                />
                <TextField
                    label="Barrio / Zona"
                    value={formData.neighborhood || ''}
                    onChange={(e) => handleChange('neighborhood', e.target.value)}
                    fullWidth
                />

                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={isUpdating}
                    sx={{ mt: 2 }}
                >
                    {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </Button>

                <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    onClick={() => dispatch(logout())}
                    sx={{ mt: 4, mb: 4 }}
                >
                    Cerrar Sesión
                </Button>
            </Box>

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast({ ...toast, open: false })}
            >
                <Alert severity={toast.severity}>{toast.message}</Alert>
            </Snackbar>
        </Container>
    );
};
