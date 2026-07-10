import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- ADD THIS IMPORT
import '../../assets/styles.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // <-- INSTANTIATE NAVIGATION HOOK

  const handleSubmit = (e) => {
    e.preventDefault();
    // After validation rules succeed, push the admin straight to the dashboard workspace!
    navigate('/dashboard'); 
  };

  return (
    <div className="auth-fluid-container">
      {/* ... keeping your modern brand layout panel exactly the same ... */}
      <div className="auth-brand-sidepanel">
        <div className="auth-logo-text">StockPulse Hub</div>
        <div className="auth-brand-headline">
          <h1>Automated Inventory Logistics & Ledger Core</h1>
          <p>Real-time enterprise warehouse controls, analytical stock optimization data matrices, and automated fulfillment workflows.</p>
        </div>
        <div className="auth-brand-footer">System Management Version 2.0</div>
      </div>

      <div className="auth-form-sidepanel">
        <div className="auth-card-wrapper">
          <h2>Welcome Back</h2>
          <p className="subtitle-text">Enter your corporate credentials to access your dashboard.</p>
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label>Corporate Email Address</label>
              <input type="email" className="auth-input-style" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="auth-form-group">
              <label>Security Password</label>
              <input type="password" className="auth-input-style" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="auth-action-btn">Authenticate Identity</button>
          </form>
          
          {/* ✅ LINK CHANGED TO AN INTERACTIVE CLICK ROUTER TRIGGER */}
          <p className="auth-redirect-prompt">
            Don't have an administrator account? <span onClick={() => navigate('/register')}>Request Access / Sign Up</span>
          </p>
        </div>
      </div>
    </div>
  );
}