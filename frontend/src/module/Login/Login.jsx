import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userRole', data.role);

        navigate('/dashboard');
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('Cannot connect to the server.');
    }
  };

  return (
    <div className="auth-container">
      <div className="split-card">
        <div className="banner-side">
          <div className="logo-placeholder">STOCKPULSE</div>
          <div className="banner-content">
            <h2 className="banner-title">Smart Stock Control</h2>
            <p className="banner-subtitle">
              Manage your inventory tracking workflows securely inside a unified data panel.
            </p>
          </div>
          <div className="banner-footer">© 2026 StockPulse Engine</div>
        </div>

        <div className="form-side">
          <div className="form-header">
            <h1 className="form-title">Welcome back</h1>
            <p className="form-subtitle">Please enter your workspace account credentials.</p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-button">
              Sign In
            </button>
          </form>

          <div className="form-footer">
            Don't have an account?
            <span className="toggle-link" onClick={() => navigate('/register')}>
              Create Account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}