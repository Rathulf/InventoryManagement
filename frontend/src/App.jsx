import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from "./module/login/LoginForm.jsx";
import Register from './module/register/RegisterForm.jsx';
import Dashboard from './module/dashboards/Dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Catch-all Root Path: Automatically redirects users to the login screen */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 2. Authentication Route Paths */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 3. Operational Analytics Management Workspace */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 4. Fallback 404 Route: Safety net redirect for invalid URL inputs */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}