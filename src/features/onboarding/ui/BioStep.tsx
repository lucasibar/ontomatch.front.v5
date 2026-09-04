
import { Box, TextField, Typography } from '@mui/material';

export const BioStep = ({ data, onChange, errors = {} }: { data: any, onChange: (d: any) => void, errors?: Record<string, string> }) => {
    return (
        <Box display="flex" flexDirection="column" gap={3}>
            <Typography variant="h6">Descripción Personal</Typography>
            <Typography variant="body2" color="text.secondary">
                Contanos un poco sobre vos para humanizar tu perfil.
            </Typography>
            <TextField
                label="Sobre mí..."
                multiline
                rows={4}
                value={data.bio || ''}
                onChange={(e) => onChange({ ...data, bio: e.target.value })}
                placeholder="Qué hacés, qué te interesa, qué estás buscando..."
                fullWidth
                error={Boolean(errors.bio)}
                helperText={errors.bio || `${(data.bio || '').length} caracteres (mínimo: 20)`}
            />
        </Box>
    );
};
