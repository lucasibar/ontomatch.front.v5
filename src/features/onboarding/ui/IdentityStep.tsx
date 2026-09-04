import { Box, Typography, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup } from '@mui/material';

export const genderOptions = [
    { value: 'male', label: 'Hombre' },
    { value: 'female', label: 'Mujer' },
    { value: 'non_binary', label: 'Persona no binaria' },
    { value: 'other', label: 'Otra identidad' },
];
export function GenderPreferences({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
    return <FormControl component="fieldset">
        <FormLabel component="legend">¿A quiénes te gustaría conocer?</FormLabel>
        <Typography variant="body2" color="text.secondary">Podés elegir más de una opción.</Typography>
        <FormGroup>
            {[{ value: 'all', label: 'Personas de cualquier género' }, ...genderOptions].map(option => <FormControlLabel key={option.value} label={option.label} control={<Checkbox checked={value.includes(option.value)} onChange={(_, checked) => {
                if (option.value === 'all') onChange(checked ? ['all'] : []);
                else onChange(checked ? [...value.filter(v => v !== 'all'), option.value] : value.filter(v => v !== option.value));
            }} />} />)}
        </FormGroup>
    </FormControl>;
}
export const IdentityStep = ({ data, onChange }: { data: any; onChange: (data: any) => void }) => <Box display="flex" flexDirection="column" gap={3}>
    <FormControl component="fieldset" required>
        <FormLabel component="legend">¿Cómo te identificás? (obligatorio)</FormLabel>
        <RadioGroup value={data.gender || ''} onChange={e => onChange({ ...data, gender: e.target.value })}>
            {genderOptions.map(option => <FormControlLabel key={option.value} value={option.value} control={<Radio required />} label={option.label} />)}
        </RadioGroup>
        {data.gender === 'other' && <TextField label="Cómo describís tu identidad (opcional)" inputProps={{ maxLength: 80 }} value={data.genderCustom || ''} onChange={e => onChange({ ...data, genderCustom: e.target.value })} helperText="Podés describirla con tus propias palabras. Aparecerá en tu perfil." />}
    </FormControl>
    <GenderPreferences value={data.gendersAllowed || []} onChange={gendersAllowed => onChange({ ...data, gendersAllowed })} />
</Box>;
