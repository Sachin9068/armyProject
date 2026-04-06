// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { locationSocket } from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      // Initialize WebSocket for non-admin? Actually admin connects separately
      if (JSON.parse(storedUser).role !== 'ADMIN') {
        locationSocket.connect(storedToken, () => {}, () => {});
        locationSocket.on('location', (data) => {
          // handle location updates globally if needed
        });
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setToken(token);
    
    // Initialize WebSocket for non-admin roles
    if (user.role !== 'ADMIN') {
      locationSocket.connect(token, () => {}, () => {});
      locationSocket.on('location', (data) => {});
    }
    return user;
  };

  const logout = () => {
    locationSocket.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isRHM: user?.role === 'RHM',
    isBHM: user?.role === 'BHM',
    isEmployee: user?.role === 'EMPLOYEE',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};