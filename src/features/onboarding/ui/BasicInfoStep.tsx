import { TextField, Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const formatBirthdate = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export const BasicInfoStep = ({ data, onChange, errors = {} }: { data: any, onChange: (d: any) => void, errors?: Record<string, string> }) => {
    return (
        <Box display="flex" flexDirection="column" gap={3}>
            <Typography variant="h6">Datos Personales Básicos</Typography>

            <TextField
                label="Nombre"
                required
                value={data.name || ''}
                onChange={(e) => onChange({ ...data, name: e.target.value })}
                fullWidth
                error={Boolean(errors.name)}
                helperText={errors.name}
            />

            <TextField
                label="Escuela de Coaching"
                required
                value={data.coachingSchool || ''}
                onChange={(e) => onChange({ ...data, coachingSchool: e.target.value })}
                fullWidth
                error={Boolean(errors.coachingSchool)}
                helperText={errors.coachingSchool || '¿Dónde estudiaste?'}
            />

            <TextField
                label="Fecha de Nacimiento"
                required
                placeholder="DD/MM/YYYY"
                value={data.birthdate || ''}
                onChange={(e) => onChange({ ...data, birthdate: formatBirthdate(e.target.value) })}
                fullWidth
                error={Boolean(errors.birthdate)}
                helperText={errors.birthdate || 'Escribí los 8 números; las barras se agregan solas'}
                inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            />

            <FormControl fullWidth required error={Boolean(errors.lookingFor)}>
                <InputLabel>¿Qué buscas?</InputLabel>
                <Select
                    value={data.lookingFor || ''}
                    label="¿Qué buscas? *"
                    onChange={(e) => onChange({ ...data, lookingFor: e.target.value })}
                >
                    <MenuItem value="serious">Algo serio</MenuItem>
                    <MenuItem value="casual_dating">Conocernos</MenuItem>
                    <MenuItem value="short_term">Pasarla bien</MenuItem>
                </Select>
                {errors.lookingFor && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{errors.lookingFor}</Typography>}
            </FormControl>
        </Box>
    );
};
