// src/pages/AdminDashboard.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Overview from './admin/Overview';
import ManageRHM from './admin/ManageRHM';
import ManageBHM from './admin/ManageBHM';
import ManageEmployees from './admin/ManageEmployees';
import LiveMap from './admin/LiveMap';
import CreateRHM from './admin/CreateRHM';
import CreateBHM from './admin/CreateBHM';
import CreateEmployee from './admin/CreateEmployee';
import LocationHistory from './LocationHistory';

const AdminDashboard = () => {
  return (
    <Layout>
      <Routes basename="/admin">
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="rhm" element={<ManageRHM />} />
        <Route path="rhm/create" element={<CreateRHM />} />
        <Route path="bhm" element={<ManageBHM />} />
        <Route path="bhm/create" element={<CreateBHM />} />
        <Route path="employees" element={<ManageEmployees />} />
        <Route path="employees/create" element={<CreateEmployee />} />
        <Route path="live-map" element={<LiveMap />} />
        <Route path="location-history/:userId" element={<LocationHistory />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </Layout>
  );
};

export default AdminDashboard;