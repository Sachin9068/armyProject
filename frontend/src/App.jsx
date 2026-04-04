import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/Admin';

// Redirect to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Redirect non-admins away from admin routes
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// Redirect already-logged-in users away from login/register
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;