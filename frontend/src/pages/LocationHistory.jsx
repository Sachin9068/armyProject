// src/pages/LocationHistory.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import MapComponent from '../components/MapComponent';

const LocationHistory = () => {
  const { userId } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/admin/locations/${userId}`);
      setHistory(res.data.data);
      if (res.data.data.length > 0) {
        // Fetch user name from employees list or separate endpoint
        const empRes = await api.get('/admin/employees');
        const emp = empRes.data.data.find(e => e._id === userId);
        if (emp) setUserName(emp.name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markers = history.map((loc, idx) => ({
    id: idx,
    name: `Location at ${new Date(loc.timestamp).toLocaleString()}`,
    lat: loc.latitude,
    lng: loc.longitude,
    updatedAt: loc.timestamp,
  }));

  if (loading) return <div className="text-center py-10">Loading history...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Location History: {userName || userId}</h1>
      <p className="text-gray-600 mb-4">Total records: {history.length}</p>
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <MapComponent markers={markers} center={markers[0] ? [markers[0].lat, markers[0].lng] : [20.5937, 78.9629]} zoom={12} />
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latitude</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Longitude</th>
            </tr>
          </thead>
          <tbody>
            {history.map(loc => (
              <tr key={loc._id}>
                <td className="px-6 py-4 text-sm text-gray-900">{new Date(loc.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{loc.latitude}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{loc.longitude}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LocationHistory;