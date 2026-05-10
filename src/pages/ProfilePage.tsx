import { Box, Typography, Container, TextField, Button, MenuItem, FormControl, InputLabel, Select, Snackbar, Alert, Slider, Autocomplete } from '@mui/material';
import { useGetMeQuery, useUpdateProfileMutation, useGetPreferencesQuery, useUpdatePreferencesMutation, useLazySearchLocationsQuery } from '../features/onboarding/api/profileApi';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/model/authSlice';
import { PhotosStep } from '../features/onboarding/ui/PhotosStep';

export const ProfilePage = () => {
    const dispatch = useDispatch();
    const { data: profile, isLoading } = useGetMeQuery(undefined);
    const { data: preferences } = useGetPreferencesQuery(undefined);
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [updatePreferences] = useUpdatePreferencesMutation();
    const [formData, setFormData] = useState<any>({});
    const [prefData, setPrefData] = useState<any>({ distanceKm: 50, ageRange: [18, 99], gendersAllowed: [] });
    const [toast, setToast] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    // Location Search Logic
    const [search, setSearch] = useState('');
    const [trigger, { data: results, isLoading: isSearching }] = useLazySearchLocationsQuery();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.length > 2) trigger(search);
        }, 300); // Optimized debounce
        return () => clearTimeout(timer);
    }, [search, trigger]);

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
                coachingSchool: profile.coachingSchool,
                // Add lookingFor if not already there
            });
        }
        if (preferences) {
            console.log('Received Preferences from API:', preferences);
            setPrefData({
                distanceKm: preferences.distanceKm || 50,
                ageRange: [preferences.ageMin || 18, preferences.ageMax || 99],
                gendersAllowed: preferences.gendersAllowed || []
            });
        }
    }, [profile, preferences]);

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

            const prefPayload = {
                distanceKm: prefData.distanceKm,
                ageMin: prefData.ageRange[0],
                ageMax: prefData.ageRange[1],
                gendersAllowed: prefData.gendersAllowed
            };

            await updatePreferences(prefPayload).unwrap();

            setToast({ open: true, message: 'Perfil y preferencias actualizados', severity: 'success' });
        } catch (error) {
            setToast({ open: true, message: 'Error al actualizar', severity: 'error' });
        }
    };

    if (isLoading) return <Typography>Cargando perfil...</Typography>;

    return (
        <Container maxWidth="sm" sx={{ pb: 10, pt: 2 }}>
            <Typography variant="h4" fontWeight="bold" mb={3}>Mi Perfil</Typography>

            {/* Reuse Photos Component - It handles its own state/API */}
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
                    label="Escuela de Coaching"
                    value={formData.coachingSchool || ''}
                    onChange={(e) => handleChange('coachingSchool', e.target.value)}
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

                <Autocomplete
                    options={(results as any[]) || []}
                    getOptionLabel={(option: any) => typeof option === 'string' ? option : `${option.locality}, ${option.province}`}
                    loading={isSearching}
                    onInputChange={(_e, newInputValue) => setSearch(newInputValue)}
                    onChange={(_e, value: any) => {
                        if (value) {
                            setFormData((prev: any) => ({ ...prev, locationId: value.id, locationText: `${value.locality}, ${value.province}` }));
                        } else {
                            setFormData((prev: any) => ({ ...prev, locationId: null, locationText: '' }));
                        }
                    }}
                    renderInput={(params) => <TextField {...params} label="Localidad / Ciudad" fullWidth />}
                    value={formData.locationText ? formData.locationText : null}
                    isOptionEqualToValue={(option, value) => {
                        const optionLabel = `${option.locality}, ${option.province}`;
                        return optionLabel === value || option.id === value?.id;
                    }}
                    renderOption={(props, option) => {
                        const { key, ...optionProps } = props;
                        return (
                            <li key={option.id || key} {...optionProps}>
                                {option.locality}, {option.province}
                            </li>
                        );
                    }}
                />
                <TextField
                    label="Barrio / Zona"
                    value={formData.neighborhood || ''}
                    onChange={(e) => handleChange('neighborhood', e.target.value)}
                    fullWidth
                />

                <Typography variant="h6" mt={2}>Preferencias de Discovery</Typography>

                <FormControl fullWidth>
                    <InputLabel>Interés en (Género)</InputLabel>
                    <Select
                        multiple
                        value={prefData.gendersAllowed || []}
                        label="Interés en (Género)"
                        onChange={(e) => {
                            const val = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                            setPrefData({ ...prefData, gendersAllowed: val });
                        }}
                        renderValue={(selected) => (selected as string[]).map(v =>
                            v === 'male' ? 'Hombres' : v === 'female' ? 'Mujeres' : v === 'non_binary' ? 'No Binarios' : v
                        ).join(', ')}
                    >
                        <MenuItem value="male">Hombres</MenuItem>
                        <MenuItem value="female">Mujeres</MenuItem>
                        <MenuItem value="non_binary">No Binarios</MenuItem>
                    </Select>
                </FormControl>

                <Box>
                    <Typography gutterBottom>Distancia Máxima: {prefData.distanceKm} km</Typography>
                    <Slider
                        value={prefData.distanceKm}
                        onChange={(_, val) => setPrefData({ ...prefData, distanceKm: val })}
                        valueLabelDisplay="auto"
                        min={1} max={100}
                    />
                </Box>

                <Box>
                    <Typography gutterBottom>Rango de Edad: {prefData.ageRange.join(' - ')} años</Typography>
                    <Slider
                        value={prefData.ageRange}
                        onChange={(_, val) => setPrefData({ ...prefData, ageRange: val })}
                        valueLabelDisplay="auto"
                        min={18} max={99}
                        disableSwap
                    />
                </Box>

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
