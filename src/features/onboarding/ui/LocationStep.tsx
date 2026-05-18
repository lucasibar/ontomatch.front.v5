import { Autocomplete, TextField, Typography, Box } from '@mui/material';
import { useLazySearchLocationsQuery } from '../api/profileApi';
import { useState, useEffect } from 'react';

export const LocationStep = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
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
            <Typography variant="h6">¿Dónde estás?</Typography>
            <Typography variant="body2" color="text.secondary">
                Esto nos ayuda a mostrarte personas cerca tuyo.
            </Typography>
            
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
                renderInput={(params) => <TextField {...params} label="Buscar localidad / ciudad" fullWidth />}
            />

            <TextField
                label="Barrio / Zona (Opcional)"
                value={data.neighborhood || ''}
                onChange={(e) => onChange({ ...data, neighborhood: e.target.value })}
                placeholder="Ej: Palermo, Güemes, etc."
                fullWidth
            />
        </Box>
    );
};
