import React, { useState } from 'react';
import '../../assets/styles.css'; 

export default function Login({ onToggleView, onLoginSuccess }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Invalid email or password");
      }

      const data = await response.json();
      setSuccess(`Success! Welcome back, ${data.name}`);
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("user_name", data.name);
      
      if (onLoginSuccess) onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="split-card">
      <div className="banner-side">
        <div className="logo-placeholder">IMS LOGO</div>
        <div className="banner-content">
          <h1 className='title-content'>StockPulse</h1>
          <p className="banner-subtitle">Real-time stock tracking, role-based controls, and seamless asset updates.</p>
        </div>
        <div className="banner-footer">SYSTEM VERSION 1.0</div>
      </div>

      <div className="form-side">
        <div className="form-header">
          <h2 className="form-title">Login</h2>
          <p className="form-subtitle">Please enter your account to Login</p>
        </div>

        {error && <p className="error-box">{error}</p>}
        {success && <p className="success-box">{success}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="name@company.com" onChange={handleChange} required />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
          </div>

          <div className="row-actions">
            <label className="remember-me">
              <input type="checkbox" style={{ marginRight: '8px' }} /> Remember me
            </label>
            <span className="forgot-password">Forgot password?</span>
          </div>

          <button type="submit" className="submit-button">LOGIN</button>
        </form>

        <div className="form-footer">
          <span style={{ color: '#666' }}>New User? </span>
          <span onClick={onToggleView} className="toggle-link">Signup</span>
        </div>
      </div>
    </div>
  );
}