// src/pages/admin/CreateRHM.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateRHM = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    armyno: '',
    rank: '',
    name: '',
    departmentTrade: '',
    mobileno: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/admin/rhm', formData);
      navigate('/admin/rhm');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create RHM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Create New RHM</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Army No</label>
          <input type="text" name="armyno" value={formData.armyno} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rank</label>
          <input type="text" name="rank" value={formData.rank} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department/Trade</label>
          <input type="text" name="departmentTrade" value={formData.departmentTrade} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile No</label>
          <input type="tel" name="mobileno" value={formData.mobileno} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate('/admin/rhm')} className="px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create RHM'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRHM;