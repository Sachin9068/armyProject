// src/pages/admin/Overview.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const Overview = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setDashboard(res.data);
    } catch (err) {
      console.error(err);
      setLoadError(err.response?.data?.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (loadError) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg">
        {loadError}
      </div>
    );
  }
  if (!dashboard) {
    return <div className="text-center py-10 text-gray-600">No data</div>;
  }

  const { stats, recentUsers = [], hierarchy, liveEmployees = [] } = dashboard;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">RHM Count</h3>
          <p className="text-2xl font-bold">{stats.totalRHM}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">BHM Count</h3>
          <p className="text-2xl font-bold">{stats.totalBHM}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Employees</h3>
          <p className="text-2xl font-bold">{stats.totalEmployees}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Employees</h3>
          <p className="text-2xl font-bold">{stats.activeEmployees}</p>
        </div>
      </div>

      {/* Hierarchy summary */}
      {hierarchy && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">RHM units</h2>
            <ul className="text-sm space-y-1 text-gray-700">
              {(hierarchy.rhmSummary || []).map((r) => (
                <li key={r._id}>
                  {r.name} · Army No {r.armyno} · BHM slots used: {r.bhmCount ?? 0}/4
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">BHM units</h2>
            <ul className="text-sm space-y-1 text-gray-700">
              {(hierarchy.bhmSummary || []).map((b) => (
                <li key={b._id}>
                  {b.name} · Army No {b.armyno} · Employees: {b.employeeCount ?? 0}/150
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Army No</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th></tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUsers.map(user => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.armyno}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Employees Preview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Live Employees ({liveEmployees.length})</h2>
          <Link to="/admin/live-map" className="text-blue-600 hover:underline">View on Map</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RHM</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BHM</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Update</th></tr>
            </thead>
            <tbody>
              {liveEmployees.map(emp => (
                <tr key={emp._id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{emp.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.rhmId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.bhmId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {emp.lastLocation?.updatedAt ? new Date(emp.lastLocation.updatedAt).toLocaleString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;