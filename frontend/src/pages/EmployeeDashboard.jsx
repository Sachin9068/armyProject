// src/pages/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { locationSocket } from '../services/socket';

const EmployeeDashboard = () => {
  const { user, token } = useAuth();
  const [locationStatus, setLocationStatus] = useState('Starting...');
  const [sharing, setSharing] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    let intervalId = null;

    locationSocket.connect(token, () => {}, () => {});

    const publishLocation = () => {
      if (!sharing) return;
      if (!navigator.geolocation) {
        setLocationStatus('Geolocation not supported');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          try {
            await api.post('/location/update', { latitude, longitude });
          } catch (err) {
            console.error('REST location update failed', err);
          }
          locationSocket.sendLocation(latitude, longitude);
          setLocationStatus('Live sharing active (every 5s)');
        },
        (err) => {
          console.error(err);
          setLocationStatus('Error accessing location');
        },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
      );
    };

    publishLocation();
    intervalId = window.setInterval(publishLocation, 20000);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      locationSocket.disconnect();
    };
  }, [token, sharing]);

  const startSharing = () => {
    setSharing(true);
    setLocationStatus('Starting...');
  };

  const stopSharing = () => {
    setSharing(false);
    setLocationStatus('Stopped');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Employee Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Location Sharing</h2>
          <div className="mb-4">
            <p className="text-gray-700">Status: <span className="font-medium">{locationStatus}</span></p>
            {currentLocation && (
              <p className="text-sm text-gray-500 mt-1">
                Current: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={startSharing}
              disabled={sharing}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Start Sharing
            </button>
            <button
              onClick={stopSharing}
              disabled={!sharing}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Stop Sharing
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-gray-500">Name</p><p className="font-medium">{user?.name}</p></div>
            <div><p className="text-gray-500">Army No</p><p className="font-medium">{user?.armyno}</p></div>
            <div><p className="text-gray-500">Rank</p><p className="font-medium">{user?.rank}</p></div>
            <div><p className="text-gray-500">Department</p><p className="font-medium">{user?.departmentTrade}</p></div>
            <div><p className="text-gray-500">Mobile</p><p className="font-medium">{user?.mobileno}</p></div>
            <div><p className="text-gray-500">Role</p><p className="font-medium">{user?.role}</p></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;