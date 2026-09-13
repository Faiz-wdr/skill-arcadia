import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WebinarPage from './pages/WebinarPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminSettings from './pages/admin/AdminSettings';
import ProtectedRoute from './components/admin/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<WebinarPage />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="registrations" element={<AdminRegistrations />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
