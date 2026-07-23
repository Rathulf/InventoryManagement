import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForcePasswordChange() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Retrieve the locked user from local storage
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (!user || !user.id) {
      toast.error("Session invalid. Please log in again.");
      navigate('/');
      return;
    }

    const toastId = toast.loading("Securing your account...");

    try {
      const response = await fetch(`https://stockpulse-cbdz.onrender.com/api/employees/${user.id}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPassword })
      });

      if (!response.ok) {
        throw new Error("Failed to update password. Please try again.");
      }

      // Fetch the updated DTO from Spring Boot (where requiresPasswordChange is now false)
      const updatedUser = await response.json();
      
      // Overwrite the locked user session with the unlocked one
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success("Account secured! Welcome to StockPulse Hub.", { id: toastId });
      
      // Redirect them into the main application
      navigate('/dashboard'); 

    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.message, { id: toastId });
    }
  };

  return (
    <div className="force-pwd-wrapper">
      <div className="force-pwd-card">
        
        <h2 className="force-pwd-title">Action Required</h2>
        <p className="force-pwd-desc">
          For security purposes, you must change your default administrator-assigned password before accessing the system.
        </p>

        <form className="force-pwd-form" onSubmit={handleSubmit}>
          <div>
            <label className="force-pwd-label">New Password</label>
            <input 
              type="password" 
              className="force-pwd-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required 
            />
          </div>

          <div>
            <label className="force-pwd-label">Confirm Password</label>
            <input 
              type="password" 
              className="force-pwd-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Type password again"
              required 
            />
          </div>

          <button type="submit" className="force-pwd-submit-btn">
            Update & Continue
          </button>
        </form>
      </div>
    </div>
  );
}