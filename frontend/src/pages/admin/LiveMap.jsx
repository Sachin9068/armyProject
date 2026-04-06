// src/pages/admin/LiveMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { locationSocket } from '../../services/socket';
import MapComponent from '../../components/MapComponent';
import { useAuth } from '../../context/AuthContext';

const LiveMap = () => {
  const { token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef(new Map());

  useEffect(() => {
    fetchLiveLocations();
    connectWebSocket();
    return () => {
      locationSocket.off('location');
      // Unsubscribe from all
      markersRef.current.forEach((_, userId) => {
        locationSocket.sendUnsubscribe(userId);
      });
    };
  }, []);

  const fetchLiveLocations = async () => {
    try {
      const res = await api.get('/admin/locations/live');
      const empData = res.data.data;
      setEmployees(empData);
      // Subscribe to each employee's updates
      empData.forEach(emp => {
        if (emp._id) {
          locationSocket.sendSubscribe(emp._id);
          markersRef.current.set(emp._id, emp);
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    locationSocket.connect(token, () => {
      console.log('WebSocket ready for admin');
    }, (err) => console.error(err));
    
    locationSocket.on('location', (data) => {
      // Update employee location
      setEmployees(prev => prev.map(emp => 
        emp._id === data.userId 
          ? { ...emp, lastLocation: { lat: data.lat, lng: data.lng, updatedAt: new Date(data.updatedAt) } }
          : emp
      ));
    });
  };

  const mapMarkers = employees
    .filter(emp => emp.lastLocation?.lat && emp.lastLocation?.lng)
    .map(emp => ({
      id: emp._id,
      name: emp.name,
      armyno: emp.armyno,
      lat: emp.lastLocation.lat,
      lng: emp.lastLocation.lng,
      updatedAt: emp.lastLocation.updatedAt,
    }));

  if (loading) return <div className="text-center py-10">Loading live map...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Live Employee Tracking</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <MapComponent markers={mapMarkers} center={[20.5937, 78.9629]} zoom={5} />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(emp => (
          <div key={emp._id} className="bg-white p-3 rounded shadow">
            <p className="font-semibold">{emp.name} ({emp.armyno})</p>
            <p className="text-sm text-gray-600">BHM: {emp.bhmId?.name || 'N/A'}</p>
            {emp.lastLocation?.lat ? (
              <p className="text-xs text-green-600">Last update: {new Date(emp.lastLocation.updatedAt).toLocaleTimeString()}</p>
            ) : (
              <p className="text-xs text-gray-400">No location data</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveMap;