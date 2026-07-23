import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from "./module/login/LoginForm.jsx";
import RegisterForm from "./module/register/RegisterForm.jsx";
import Dashboard from './module/dashboards/Dashboard';

// 1. Create a security wrapper for protected pages
const ProtectedRoute = ({ children }) => {
  // Check local storage to see if the user has a valid session saved
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Catch-all Root Path */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication Route Paths */}
        <Route path="/login" element={<LoginForm/>} />
        <Route path="/register" element={<RegisterForm/>} />

        {/* 2. Wrap the Dashboard in the ProtectedRoute */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          } 
        />

        {/* Fallback 404 Route */}
        <Route path="*" element={<Navigate to="/login" replace/>} />
      </Routes>
      <Route path="/force-password-change" element={<ForcePasswordChange />} />
    </Router>
  );
}