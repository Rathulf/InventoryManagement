import React, { useState } from 'react';
import '../../assets/styles.css';

export default function Register({ onRegisterSuccess, onToggleView }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Failed to register");
      }

      alert('Registration successful! Redirecting to login view.');
      onRegisterSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="split-card">
      <div className="banner-side">
        <div className="logo-placeholder">IMS LOGO</div>
        <div className="banner-content">
          <h1 className="banner-title">JOIN THE NETWORK</h1>
          <p className="banner-subtitle">Create an administrative or staff level account to manage items globally.</p>
        </div>
        <div className="banner-footer">SYSTEM VERSION 1.0</div>
      </div>

      <div className="form-side">
        <div className="form-header">
          <h2 className="form-title">Register</h2>
          <p className="form-subtitle">Set up your profile to receive stock alteration clearance authorization.</p>
        </div>

        {error && <p className="error-box">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="John Doe" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="name@company.com" onChange={handleChange} required />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>System Access Role</label>
            <select name="role" onChange={handleChange}>
              <option value="STAFF">Staff Member (Read/Edit Stock)</option>
              <option value="ADMIN">Admin / Owner (Full System Control)</option>
            </select>
          </div>

          <button type="submit" className="submit-button">REGISTER</button>
        </form>

        <div className="form-footer">
          <span style={{ color: '#666' }}>Already have an account? </span>
          <span onClick={onToggleView} className="toggle-link">Sign In</span>
        </div>
      </div>
    </div>
  );
}