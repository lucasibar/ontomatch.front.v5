import { TextField, Box, MenuItem, Typography } from '@mui/material';

export const BasicInfoStep = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
    return (
        <Box display="flex" flexDirection="column" gap={3}>
            <Typography variant="h6">Tell us about yourself</Typography>

            <TextField label="Display Name" value={data.name || ''} onChange={(e) => onChange({ ...data, name: e.target.value })} fullWidth />

            <TextField
                label="Birth Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={data.birthdate || ''}
                onChange={(e) => onChange({ ...data, birthdate: e.target.value })}
                fullWidth
            />

            <TextField
                select
                label="Gender"
                value={data.gender || ''}
                onChange={(e) => onChange({ ...data, gender: e.target.value })}
                fullWidth
            >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="non_binary">Non-Binary</MenuItem>
            </TextField>

            <TextField
                select
                label="Orientation"
                value={data.orientation || ''}
                onChange={(e) => onChange({ ...data, orientation: e.target.value })}
                fullWidth
            >
                <MenuItem value="heterosexual">Heterosexual</MenuItem>
                <MenuItem value="homosexual">Homosexual</MenuItem>
                <MenuItem value="bisexual">Bisexual</MenuItem>
                <MenuItem value="pansexual">Pansexual</MenuItem>
                <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
                select
                label="Looking For"
                value={data.lookingFor || ''}
                onChange={(e) => onChange({ ...data, lookingFor: e.target.value })}
                fullWidth
            >
                <MenuItem value="relationship">Relationship</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="friends">Friends</MenuItem>
                <MenuItem value="networking">Networking</MenuItem>
                <MenuItem value="unspecified">Unspecified</MenuItem>
            </TextField>
        </Box>
    );
};
