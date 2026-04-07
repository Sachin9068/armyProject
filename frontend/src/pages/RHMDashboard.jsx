// src/pages/RHMDashboard.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const RHMDashboard = () => {
  const [bhms, setBhms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bhmRes, empRes] = await Promise.all([
        api.get('/admin/bhm'),
        api.get('/admin/employees')
      ]);
      setBhms(bhmRes.data.data || []);
      setEmployees(empRes.data.data || []);
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
        <h1 className="text-2xl font-bold">RHM Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My BHM Units ({bhms.length}/4)</h2>
            <div className="space-y-3">
              {bhms.map(bhm => (
                <div key={bhm._id} className="border-b pb-2">
                  <p className="font-medium">{bhm.name}</p>
                  <p className="text-sm text-gray-600">Army No: {bhm.armyno} | Employees: {bhm.employeeCount}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Total Employees Under Me</h2>
            <p className="text-3xl font-bold text-blue-600">{employees.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Employees List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Army No</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BHM</th></tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp._id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{emp.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.armyno}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.bhmId?.name || 'N/A'}</td>
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

export default RHMDashboard;