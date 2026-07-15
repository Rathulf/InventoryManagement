import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Password reset flow states
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  const navigate = useNavigate();

  // Initial Login Check
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    fetch('http://localhost:8080/api/employees/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((userData) => {
        if (userData.requiresPasswordChange) {
          setTempUserData(userData);
          setIsResetMode(true); // Switch to password reset screen
        } else {
          finalizeLogin(userData); // Standard login
        }
      })
      .catch(() => setError("Invalid credentials or inactive account."));
  };

  // Submit New Password
  const handlePasswordReset = (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    fetch(`http://localhost:8080/api/employees/${tempUserData.id}/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to update password");
        return res.json();
      })
      .then((updatedUserData) => {
        finalizeLogin(updatedUserData);
      })
      .catch((err) => {
        console.error(err);
        setError("An error occurred while saving your password.");
      });
  };

  // Save session and redirect
  const finalizeLogin = (userData) => {
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userName', userData.name);
    navigate('/dashboard');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h2>StockPulse Hub</h2>
          <p>{isResetMode ? "First time login setup" : "Please sign in to continue"}</p>
        </div>
        
        {isResetMode ? (
          <form className="login-form" onSubmit={handlePasswordReset}>
            {error && <div className="login-error-alert">{error}</div>}
            <div className="input-group">
              <label>Create a New Password</label>
              <input 
                type="password" 
                placeholder="New password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                placeholder="Type it again" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="login-submit-btn">Save & Continue</button>
          </form>
        ) : (
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
        )}
      </div>
    </div>
  );
}