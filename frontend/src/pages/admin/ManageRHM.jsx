// src/pages/admin/ManageRHM.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const ManageRHM = () => {
  const [rhms, setRhms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRHMs();
  }, []);

  const fetchRHMs = async () => {
    try {
      const res = await api.get('/admin/rhm');
      setRhms(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">RHM Management</h1>
        <Link to="/admin/rhm/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Create New RHM
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Army No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BHM Count</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rhms.map(rhm => (
              <tr key={rhm._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rhm.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rhm.armyno}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rhm.rank}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rhm.departmentTrade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rhm.mobileno}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rhm.bhmCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRHM;