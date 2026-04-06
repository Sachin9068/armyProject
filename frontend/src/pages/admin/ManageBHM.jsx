// src/pages/admin/ManageBHM.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const ManageBHM = () => {
  const [bhms, setBhms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reassignModal, setReassignModal] = useState({ open: false, bhmId: null });
  const [rhms, setRhms] = useState([]);
  const [selectedRhmId, setSelectedRhmId] = useState('');

  useEffect(() => {
    fetchBHMs();
    fetchRHMs();
  }, []);

  const fetchBHMs = async () => {
    try {
      const res = await api.get('/admin/bhm');
      setBhms(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRHMs = async () => {
    try {
      const res = await api.get('/admin/rhm');
      setRhms(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReassign = async () => {
    try {
      await api.patch('/admin/assign-bhm', {
        bhmId: reassignModal.bhmId,
        rhmId: selectedRhmId,
      });
      setReassignModal({ open: false, bhmId: null });
      fetchBHMs();
    } catch (err) {
      alert(err.response?.data?.message || 'Reassignment failed');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">BHM Management</h1>
        <Link to="/admin/bhm/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Create New BHM
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Army No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RHM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bhms.map(bhm => (
              <tr key={bhm._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bhm.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bhm.armyno}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bhm.rhmId?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bhm.employeeCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => setReassignModal({ open: true, bhmId: bhm._id })}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Reassign RHM
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reassign Modal */}
      {reassignModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Reassign BHM to RHM</h3>
            <select
              value={selectedRhmId}
              onChange={(e) => setSelectedRhmId(e.target.value)}
              className="w-full border rounded-md p-2 mb-4"
            >
              <option value="">Select RHM</option>
              {rhms.map(rhm => (
                <option key={rhm._id} value={rhm._id}>{rhm.name}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setReassignModal({ open: false, bhmId: null })} className="px-4 py-2 border rounded-md">Cancel</button>
              <button onClick={handleReassign} className="px-4 py-2 bg-blue-600 text-white rounded-md">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBHM;