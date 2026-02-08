
import { Box, Typography, Slider, FormControl, FormLabel } from '@mui/material';

export const PreferencesStep = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {

    const handleDistanceChange = (event: Event, newValue: number | number[]) => {
        onChange({ ...data, distanceKm: newValue as number });
    };

    const handleAgeRangeChange = (event: Event, newValue: number | number[]) => {
        onChange({ ...data, ageRange: newValue as number[] });
    };

    return (
        <Box display="flex" flexDirection="column" gap={4}>
            <Typography variant="h6">Preferencias Iniciales</Typography>

            <Box>
                <Typography gutterBottom>Distancia Máxima: {data.distanceKm || 50} km</Typography>
                <Slider
                    value={data.distanceKm || 50}
                    onChange={handleDistanceChange}
                    valueLabelDisplay="auto"
                    min={1}
                    max={100}
                />
            </Box>

            <Box>
                <Typography gutterBottom>Rango de Edad: {(data.ageRange || [18, 99]).join(' - ')} años</Typography>
                <Slider
                    value={data.ageRange || [18, 99]}
                    onChange={handleAgeRangeChange}
                    valueLabelDisplay="auto"
                    min={18}
                    max={99}
                    disableSwap
                />
            </Box>

            <Typography variant="caption" color="text.secondary">
                * Estas preferencias se pueden modificar luego desde Ajustes.
            </Typography>
        </Box>
    );
};
