import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  useEffect(() => {
    // Intercept redirect flags generated out of registration completions
    const pendingNotice = sessionStorage.getItem("registerSuccessNotification");
    if (pendingNotice) {
      setSuccessNotice(pendingNotice);
      sessionStorage.removeItem("registerSuccessNotification");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessNotice("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const authenticatedUser = await response.json();
        localStorage.setItem("activeUser", JSON.stringify(authenticatedUser));
        
        // Pass validation flag onwards down the storage engine to trigger user greetings
        sessionStorage.setItem("loginSuccessNotification", "true");
        navigate("/dashboard");
        return;
      }

      if (response.status === 401) {
        setError("Invalid email or password combination specified.");
      } else {
        setError("Authentication check failed. Access denied.");
      }

    } catch (err) {
      setError("API Connection Offline. Failed to handle account security assertion rules.");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="banner-side">
        <div className="logo-placeholder">IMS LOGO</div>
        <div className="banner-content">
          <h1 className="banner-title">STOCKPULSE HUB</h1>
          <p className="banner-subtitle">
            Real-time enterprise warehouse controls and automated inventory ledger distribution panels.
          </p>
        </div>
        <div className="banner-footer">SYSTEM VERSION 1.0</div>
      </div>

      <div className="form-side">
        <div className="form-header">
          <h2 className="form-title">Sign In</h2>
          <p className="form-subtitle">Enter your corporate credentials to access your dashboard.</p>
        </div>

        {successNotice && <div className="alert-box success-alert">{successNotice}</div>}
        {error && <div className="alert-box error-alert">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="josc@gmail.com"
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

          <button type="submit" className="submit-button">
            Login
          </button>
        </form>

        <div className="form-footer">
          Don't have an account? 
          <span className="toggle-link" onClick={() => navigate("/register")}>
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
}