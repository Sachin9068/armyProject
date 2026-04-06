// src/pages/BHMDashboard.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BHMDashboard = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/admin/employees');
      const myEmployees = res.data.data.filter(e => e.bhmId?._id === user.id);
      setEmployees(myEmployees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="text-center py-10">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">BHM Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Employee Count</h2>
            <p className="text-3xl font-bold text-green-600">{employees.length}/150</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">My Employees</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Army No</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th></tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp._id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{emp.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.armyno}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BHMDashboard;