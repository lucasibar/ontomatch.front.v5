import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';

export const RequireVerifiedEmail = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    if (user?.isEmailVerified === false) {
        return <Navigate to="/verify-email" replace />;
    }

    return <Outlet />;
};
