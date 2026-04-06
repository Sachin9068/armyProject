// src/components/RoleBasedRedirect.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  switch (user?.role) {
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    case 'RHM':
      return <Navigate to="/rhm" replace />;
    case 'BHM':
      return <Navigate to="/bhm" replace />;
    case 'EMPLOYEE':
      return <Navigate to="/employee" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRedirect;