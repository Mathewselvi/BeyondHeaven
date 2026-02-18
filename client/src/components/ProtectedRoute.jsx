import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = () => {
    const admin = useAuthStore((state) => state.admin);

    return admin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
