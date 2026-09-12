import { Box, Typography, TextField, FormControl, FormLabel, FormHelperText, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup } from '@mui/material';
import { genderOptions, normalizeGenderPreferences } from '../model/genderOptions';

export function GenderPreferences({
    value,
    customValue = '',
    onChange,
    onCustomChange,
    customError,
}: {
    value: string[];
    customValue?: string;
    onChange: (value: string[]) => void;
    onCustomChange?: (value: string) => void;
    customError?: string;
}) {
    const normalizedValue = normalizeGenderPreferences(value);

    return <FormControl component="fieldset">
        <FormLabel component="legend">¿A quiénes te gustaría conocer?</FormLabel>
        <Typography variant="body2" color="text.secondary">Podés elegir más de una opción.</Typography>
        <FormGroup>
            {genderOptions.map(option => <FormControlLabel key={option.value} label={option.label} control={<Checkbox checked={normalizedValue.includes(option.value)} onChange={(_, checked) => {
                onChange(checked ? [...normalizedValue, option.value] : normalizedValue.filter(v => v !== option.value));
            }} />} />)}
        </FormGroup>
        {normalizedValue.includes('other') && onCustomChange && (
            <TextField
                required
                label="¿Qué otra identidad buscás?"
                inputProps={{ maxLength: 80 }}
                value={customValue}
                onChange={event => onCustomChange(event.target.value)}
                error={Boolean(customError)}
                helperText={customError || 'Escribila con tus propias palabras.'}
                sx={{ mt: 1 }}
            />
        )}
    </FormControl>;
}
export const IdentityStep = ({ data, onChange, errors = {} }: { data: any; onChange: (data: any) => void; errors?: Record<string, string> }) => <Box display="flex" flexDirection="column" gap={3}>
    <FormControl component="fieldset" required error={Boolean(errors.gender)}>
        <FormLabel component="legend">¿Cómo te identificás? (obligatorio)</FormLabel>
        <RadioGroup value={data.gender || ''} onChange={e => onChange({ ...data, gender: e.target.value })}>
            {genderOptions.map(option => <FormControlLabel key={option.value} value={option.value} control={<Radio required />} label={option.label} />)}
        </RadioGroup>
        {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
        {data.gender === 'other' && <TextField required label="¿Cómo describís tu identidad?" inputProps={{ maxLength: 80 }} value={data.genderCustom || ''} onChange={e => onChange({ ...data, genderCustom: e.target.value })} error={Boolean(errors.genderCustom)} helperText={errors.genderCustom || 'Escribila con tus propias palabras. Aparecerá en tu perfil.'} />}
    </FormControl>
    <Box>
        <GenderPreferences
            value={data.gendersAllowed || []}
            customValue={data.gendersAllowedCustom?.[0] || ''}
            onChange={gendersAllowed => onChange({ ...data, gendersAllowed, ...(gendersAllowed.includes('other') ? {} : { gendersAllowedCustom: [] }) })}
            onCustomChange={custom => onChange({ ...data, gendersAllowedCustom: custom ? [custom] : [] })}
            customError={errors.gendersAllowedCustom}
        />
        {errors.gendersAllowed && <FormHelperText error>{errors.gendersAllowed}</FormHelperText>}
    </Box>
</Box>;
