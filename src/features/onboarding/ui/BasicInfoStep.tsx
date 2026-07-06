import { TextField, Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export const BasicInfoStep = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
    return (
        <Box display="flex" flexDirection="column" gap={3}>
            <Typography variant="h6">Datos Personales Básicos</Typography>

            <TextField
                label="Nombre"
                required
                value={data.name || ''}
                onChange={(e) => onChange({ ...data, name: e.target.value })}
                fullWidth
            />

            <TextField
                label="Escuela de Coaching"
                required
                value={data.coachingSchool || ''}
                onChange={(e) => onChange({ ...data, coachingSchool: e.target.value })}
                fullWidth
                helperText="¿Dónde estudiaste?"
            />

            <TextField
                label="Fecha de Nacimiento"
                required
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
                onChange={(e) => onChange({ ...data, height: parseInt(e.target.value) || '' })}
                fullWidth
                helperText="Ej: 175"
            />

            <FormControl fullWidth required>
                <InputLabel>¿Qué buscas?</InputLabel>
                <Select
                    value={data.lookingFor || ''}
                    label="¿Qué buscas? *"
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
