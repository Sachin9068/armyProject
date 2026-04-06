// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import RHMDashboard from './pages/RHMDashboard';
import BHMDashboard from './pages/BHMDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LocationHistory from './pages/LocationHistory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleBasedRedirect />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          {/* RHM Routes */}
          <Route path="/rhm/*" element={
            <PrivateRoute allowedRoles={['RHM']}>
              <RHMDashboard />
            </PrivateRoute>
          } />
          
          {/* BHM Routes */}
          <Route path="/bhm/*" element={
            <PrivateRoute allowedRoles={['BHM']}>
              <BHMDashboard />
            </PrivateRoute>
          } />
          
          {/* Employee Routes */}
          <Route path="/employee/*" element={
            <PrivateRoute allowedRoles={['EMPLOYEE']}>
              <EmployeeDashboard />
            </PrivateRoute>
          } />
          
          {/* Shared location history route (admin accessible) */}
          <Route path="/location-history/:userId" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <LocationHistory />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;