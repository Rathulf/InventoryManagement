import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles.css";

export default function Register() {
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const registrationData = {
      name: fullName,
      email: email,
      password: password,
      role: role
    };

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        // Set cross-view browser state notice prior to pushing dashboard coords
        sessionStorage.setItem(
          "registerSuccessNotification", 
          "Profile account successfully created! Use your credentials to sign in."
        );
        navigate("/login");
        return;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setError(data.error || "Failed to finalize system registration profile.");
      } else {
        const plainTextError = await response.text();
        setError(plainTextError || `Server execution faulted with code: ${response.status}`);
      }

    } catch (err) {
      setError("Network offline. Unable to transmit payload data records to Spring Boot api node.");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="banner-side">
        <div className="logo-placeholder">IMS LOGO</div>
        <div className="banner-content">
          <h1 className="banner-title">JOIN THE NETWORK</h1>
          <p className="banner-subtitle">
            Create an administrative or staff level profile registry token to manage inventory assets globally.
          </p>
        </div>
        <div className="banner-footer">SYSTEM VERSION 1.0</div>
      </div>

      <div className="form-side">
        <div className="form-header">
          <h2 className="form-title">Register</h2>
          <p className="form-subtitle">Set up your credentials to gain clear clearance authorization.</p>
        </div>

        {error && <div className="alert-box error-alert">{error}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Straus"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Straus@gmail.com"
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

          <div className="input-group">
            <label>System Access Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="ADMIN">Admin / Owner (Full System Control)</option>
              <option value="STAFF">Staff Member (Read/Edit Stock)</option>
            </select>
          </div>

          <button type="submit" className="submit-button">
            Register
          </button>
        </form>

        <div className="form-footer">
          Already have an account? 
          <span className="toggle-link" onClick={() => navigate("/login")}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
}