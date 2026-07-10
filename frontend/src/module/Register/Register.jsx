import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- ADD THIS IMPORT
import '../../assets/styles.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // <-- INSTANTIATE NAVIGATION HOOK

  const handleSubmit = (e) => {
    e.preventDefault();
    // On registration commit, push the operator directly to the sign-in hub
    alert("Administrative entry profile provisioned successfully.");
    navigate('/login');
  };

  return (
    <div className="auth-fluid-container">
      {/* ... keeping your brand header setup exactly the same ... */}
      <div className="auth-brand-sidepanel">
        <div className="auth-logo-text">StockPulse Hub</div>
        <div className="auth-brand-headline">
          <h1>Establish Administrative System Nodes</h1>
          <p>Create secure operator accounts to provision infrastructure configurations, inventory ledgers, and threshold metrics paths.</p>
        </div>
        <div className="auth-brand-footer">System Management Version 2.0</div>
      </div>

      <div className="auth-form-sidepanel">
        <div className="auth-card-wrapper">
          <h2>Create Account</h2>
          <p className="subtitle-text">Provision a fresh system profile context node here.</p>
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label>Full Operator Name</label>
              <input type="text" className="auth-input-style" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="auth-form-group">
              <label>Authorized Email Address</label>
              <input type="email" className="auth-input-style" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="auth-form-group">
              <label>Access Password</label>
              <input type="password" className="auth-input-style" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="auth-action-btn">Register Administrator</button>
          </form>
          
          {/* ✅ LINK CHANGED TO AN INTERACTIVE CLICK ROUTER TRIGGER */}
          <p className="auth-redirect-prompt">
            Already have an active profile node? <span onClick={() => navigate('/login')}>Sign In Instead</span>
          </p>
        </div>
      </div>
    </div>
  );
}