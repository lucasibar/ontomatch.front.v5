import { useState } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

export const PasswordField = ({ InputProps, ...props }: TextFieldProps) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const actionLabel = isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña';

    return (
        <TextField
            {...props}
            type={isPasswordVisible ? 'text' : 'password'}
            InputProps={{
                ...InputProps,
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label={actionLabel}
                            title={actionLabel}
                            edge="end"
                            onClick={() => setIsPasswordVisible((visible) => !visible)}
                            onMouseDown={(event) => event.preventDefault()}
                        >
                            {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};
