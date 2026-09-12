
import { Box, Typography, Slider } from '@mui/material';

export const PreferencesStep = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {

    const handleDistanceChange = (_event: Event, newValue: number | number[]) => {
        onChange({ ...data, distanceKm: newValue as number });
    };

    const handleAgeRangeChange = (_event: Event, newValue: number | number[]) => {
        onChange({ ...data, ageRange: newValue as number[] });
    };

    return (
        <Box display="flex" flexDirection="column" gap={4}>
            <Typography variant="h6">Distancia y edad</Typography>



            <Box>
                <Typography gutterBottom>Distancia Máxima: {data.distanceKm || 50} km</Typography>
                <Slider
                    aria-label="Distancia máxima en kilómetros" value={data.distanceKm || 50}
                    onChange={handleDistanceChange}
                    valueLabelDisplay="auto"
                    min={1}
                    max={100}
                />
            </Box>

            <Box>
                <Typography gutterBottom>Rango de Edad: {(data.ageRange || [18, 99]).join(' - ')} años</Typography>
                <Slider
                    getAriaLabel={index => index === 0 ? 'Edad mínima' : 'Edad máxima'} value={data.ageRange || [18, 99]}
                    onChange={handleAgeRangeChange}
                    valueLabelDisplay="auto"
                    min={18}
                    max={99}
                    disableSwap
                />
            </Box>

            <Typography variant="caption" color="text.secondary">
                Podés cambiar estos filtros desde tu perfil.
            </Typography>
        </Box>
    );
};
