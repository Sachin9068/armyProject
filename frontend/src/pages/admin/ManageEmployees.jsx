// src/pages/admin/ManageEmployees.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reassignModal, setReassignModal] = useState({ open: false, employeeId: null });
  const [bhms, setBhms] = useState([]);
  const [selectedBhmId, setSelectedBhmId] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchBHMs();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/admin/employees');
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBHMs = async () => {
    try {
      const res = await api.get('/admin/bhm');
      setBhms(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReassign = async () => {
    try {
      await api.patch('/admin/assign-employee', {
        employeeId: reassignModal.employeeId,
        bhmId: selectedBhmId,
      });
      setReassignModal({ open: false, employeeId: null });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Reassignment failed');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
        <Link to="/admin/employees/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Create New Employee
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Army No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RHM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BHM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map(emp => (
              <tr key={emp._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.armyno}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.rhmId?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.bhmId?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link to={`/admin/location-history/${emp._id}`} className="text-blue-600 mr-3 hover:text-blue-800">History</Link>
                  <button onClick={() => setReassignModal({ open: true, employeeId: emp._id })} className="text-green-600 hover:text-green-800">Reassign BHM</button>
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
            <h3 className="text-lg font-semibold mb-4">Reassign Employee to BHM</h3>
            <select
              value={selectedBhmId}
              onChange={(e) => setSelectedBhmId(e.target.value)}
              className="w-full border rounded-md p-2 mb-4"
            >
              <option value="">Select BHM</option>
              {bhms.map(bhm => (
                <option key={bhm._id} value={bhm._id}>{bhm.name}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setReassignModal({ open: false, employeeId: null })} className="px-4 py-2 border rounded-md">Cancel</button>
              <button onClick={handleReassign} className="px-4 py-2 bg-blue-600 text-white rounded-md">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;