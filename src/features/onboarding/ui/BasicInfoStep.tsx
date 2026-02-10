import { TextField, Box, Typography, Autocomplete, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import { useLazySearchLocationsQuery } from '../api/profileApi';

export const BasicInfoStep = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
    // Location Search Logic
    const [search, setSearch] = useState('');
    const [trigger, { data: results, isLoading }] = useLazySearchLocationsQuery();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.length > 2) trigger(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, trigger]);

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            <Typography variant="h6">Datos Personales Básicos</Typography>

            <TextField
                label="Nombre"
                value={data.name || ''}
                onChange={(e) => onChange({ ...data, name: e.target.value })}
                fullWidth
            />

            <TextField
                label="Fecha de Nacimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={data.birthdate || ''}
                onChange={(e) => onChange({ ...data, birthdate: e.target.value })}
                fullWidth
            />

            <TextField
                label="Altura (cm)"
                type="number"
                value={data.height || ''}
                onChange={(e) => onChange({ ...data, height: parseInt(e.target.value) })}
                fullWidth
                helperText="Ej: 175"
            />

            <Autocomplete
                options={(results as any[]) || []}
                getOptionLabel={(option: any) => `${option.locality}, ${option.province}`}
                loading={isLoading}
                onInputChange={(_e, newInputValue) => setSearch(newInputValue)}
                onChange={(_e, value: any) => {
                    if (value) {
                        onChange({ ...data, locationId: value.id, locationText: value.locality });
                    }
                }}
                renderInput={(params) => <TextField {...params} label="Localidad / Ciudad" fullWidth />}
                value={data.locationText ? { locality: data.locationText, province: '' } : null}
                // Note: value prop might be tricky if object doesn't match option reference. 
                // For MVP, if they select, it sets text. If coming back, it shows text if we map it correctly.
                // Simplified: just rely on input text or don't control value fully if complex.
                // Let's rely on controlled input via freeSolo or just trust the selection.
                isOptionEqualToValue={(option, value) => option.locality === value.locality}
            />

            <TextField
                label="Barrio / Zona (Opcional)"
                value={data.neighborhood || ''}
                onChange={(e) => onChange({ ...data, neighborhood: e.target.value })}
                fullWidth
            />

            <FormControl fullWidth>
                <InputLabel>¿Qué buscas?</InputLabel>
                <Select
                    value={data.lookingFor || ''}
                    label="¿Qué buscas?"
                    onChange={(e) => onChange({ ...data, lookingFor: e.target.value })}
                >
                    <MenuItem value="sessions_1_on_1">Sesiones 1 a 1</MenuItem>
                    <MenuItem value="networking">Networking profesional</MenuItem>
                    <MenuItem value="relationship">Pareja</MenuItem>
                    <MenuItem value="casual">Algo casual</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};
