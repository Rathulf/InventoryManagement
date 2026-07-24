import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import '../../assets/styles.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Trigger a loading notification
    const toastId = toast.loading("Provisioning administrative account...");

    try {
      // 2. Send the actual data to your live Spring Boot backend
      const response = await fetch('https://stockpulse-cbdz.onrender.com/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          role: 'Admin', // Hardcoded as Admin since this is the system setup page
          status: 'Active'
        })
      });

      if (!response.ok) {
        // Catch validation errors (like the 8-character password limit)
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register account.");
      }

      // 3. Show success message and redirect to login
      toast.success("Administrative entry profile provisioned successfully.", { id: toastId });
      navigate('/login');

    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message, { id: toastId });
    }
  };

  return (
    <div className="auth-fluid-container">
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
          
          <p className="auth-redirect-prompt">
            Already have an active profile node? <span onClick={() => navigate('/login')}>Sign In Instead</span>
          </p>
        </div>
      </div>
    </div>
  );
}