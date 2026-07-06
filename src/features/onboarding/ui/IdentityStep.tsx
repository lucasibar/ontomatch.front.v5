
import { Box, Typography, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup } from '@mui/material';

export const IdentityStep = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
    // Gender types
    const genders = [
        { value: 'male', label: 'Hombre' },
        { value: 'female', label: 'Mujer' },
        { value: 'non_binary', label: 'No binario' },
        { value: 'other', label: 'Otra identidad' },
    ];

    const currentGendersAllowed = data.gendersAllowed || [];

    const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, gender: e.target.value });
    };

    const handleLookingForChange = (value: string, checked: boolean) => {
        let newGeneros = [];
        if (checked) {
            newGeneros = [...currentGendersAllowed, value];
        } else {
            newGeneros = currentGendersAllowed.filter((g: string) => g !== value);
        }
        onChange({ ...data, gendersAllowed: newGeneros });
    };

    return (
        <Box display="flex" flexDirection="column" gap={4}>
            <Typography variant="h6">Identidad y Búsqueda</Typography>

            {/* My Gender */}
            <FormControl>
                <FormLabel>¿Con qué género te distinguís?</FormLabel>
                <RadioGroup value={data.gender || ''} onChange={handleGenderChange}>
                    {genders.map((g) => (
                        <FormControlLabel key={g.value} value={g.value} control={<Radio />} label={g.label} />
                    ))}
                </RadioGroup>
                {data.gender === 'other' && (
                    <TextField
                        label="Especificá tu identidad"
                        value={data.genderCustom || ''}
                        onChange={(e) => onChange({ ...data, genderCustom: e.target.value })}
                        margin="dense"
                        fullWidth
                        helperText="Ej: Fluido, Terian, etc."
                    />
                )}
            </FormControl>

            {/* Looking For */}
            <FormControl>
                <FormLabel>¿Qué géneros buscás?</FormLabel>
                <FormGroup>
                    {genders.map((g) => (
                        <FormControlLabel
                            key={g.value}
                            control={
                                <Checkbox
                                    checked={currentGendersAllowed.includes(g.value)}
                                    onChange={(e) => handleLookingForChange(g.value, e.target.checked)}
                                />
                            }
                            label={g.label}
                        />
                    ))}
                </FormGroup>
                {currentGendersAllowed.includes('other') && (
                    <TextField
                        label="¿Qué identidad buscás?"
                        value={data.gendersAllowedCustomStr || ''}
                        onChange={(e) => onChange({ ...data, gendersAllowedCustomStr: e.target.value })}
                        margin="dense"
                        fullWidth
                        helperText="Separá con comas si buscás más de una. Ej: Fluido, Terian"
                    />
                )}
            </FormControl>
        </Box>
    );
};
