import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    fetch('http://localhost:8080/api/employees/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorMessage = await res.text();
          throw new Error(errorMessage);
        }
        return res.json();
      })
      .then((userData) => {
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userName', userData.name);
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error("Login failed:", err);
        setError("Invalid credentials or inactive account.");
      });
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h2>StockPulse Hub</h2>
          <p>Please sign in to continue</p>
        </div>
        
        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="login-error-alert">{error}</div>}
          
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="e.g., clio@gmail.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="login-submit-btn">Sign In</button>
        </form>
      </div>
    </div>
  );
}