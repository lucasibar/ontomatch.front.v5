import { Autocomplete, TextField, Typography, Box } from '@mui/material';
import { useLazySearchLocationsQuery } from '../api/profileApi';
import { useState, useEffect } from 'react';

export const LocationStep = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
    const [search, setSearch] = useState('');
    // Simple debounce fallback if hook missing: just pass search directly but might spam
    const [trigger, { data: results, isLoading }] = useLazySearchLocationsQuery();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.length > 2) trigger(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, trigger]);

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Where are you based?</Typography>
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
                renderInput={(params) => <TextField {...params} label="Search City (Argentina)" fullWidth />}
            />
        </Box>
    );
};
