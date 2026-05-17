import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { hideToast } from '../model/uiSlice';

export const GlobalToast = () => {
    const dispatch = useDispatch();
    const toast = useSelector((state: RootState) => state.ui.toast);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        dispatch(hideToast());
    };

    return (
        <Snackbar
            open={toast.open}
            autoHideDuration={4000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert onClose={handleClose} severity={toast.severity} sx={{ width: '100%' }}>
                {toast.message}
            </Alert>
        </Snackbar>
    );
};
