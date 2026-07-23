import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles.css';
import { login, changePassword } from "../../AuthService";

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Use the live login function from AuthService
      const userData = await login(email, password);
      
      if (userData.requiresPasswordChange) {
        setTempUserData(userData);
        setIsResetMode(true);
      } else {
        finalizeLogin(userData); 
      }
    } catch (err) {
      setError("Invalid credentials or inactive account.");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const updatedUserData = await changePassword(tempUserData.id, newPassword);
      finalizeLogin(updatedUserData);
    } catch (err) {
      console.error(err);
      setError("An error occurred while saving your password.");
    }
  };

  // Save session and redirect
  const finalizeLogin = (userData) => {
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('isLoggedIn', 'true'); 
    
    // NEW: Save the actual JWT provided by your Spring Boot server
    // Note: Make sure your Java backend actually sends the token back inside the userData object!
    if (userData.token) {
      localStorage.setItem('jwt_token', userData.token); 
    }

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