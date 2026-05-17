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
        }, 300); // Optimized debounce
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
                label="Escuela de Coaching"
                value={data.coachingSchool || ''}
                onChange={(e) => onChange({ ...data, coachingSchool: e.target.value })}
                fullWidth
                helperText="¿Dónde estudiaste?"
            />

            <TextField
                label="Fecha de Nacimiento"
                placeholder="DD/MM/YYYY"
                value={data.birthdate || ''}
                onChange={(e) => onChange({ ...data, birthdate: e.target.value })}
                fullWidth
                helperText="Formato: DD/MM/YYYY"
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
                getOptionLabel={(option: any) => typeof option === 'string' ? option : `${option.locality}, ${option.province}`}
                loading={isLoading}
                onInputChange={(_e, newInputValue) => setSearch(newInputValue)}
                onChange={(_e, value: any) => {
                    if (value) {
                        onChange({ ...data, locationId: value.id, locationText: `${value.locality}, ${value.province}` });
                    } else {
                        onChange({ ...data, locationId: null, locationText: '' });
                    }
                }}
                renderInput={(params) => <TextField {...params} label="Localidad / Ciudad" fullWidth />}
                value={data.locationText ? data.locationText : null}
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
                    <MenuItem value="serious">Algo serio</MenuItem>
                    <MenuItem value="casual_dating">Conocernos y ver qué pasa</MenuItem>
                    <MenuItem value="short_term">Pasarla bien (Corto plazo)</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};
