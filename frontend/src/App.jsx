import React, { useState } from "react";
import Login from "./module/Login/Login.jsx";
import Register from "./module/Register/Register.jsx";
import "./assets/styles.css";

function App() {
  const [view, setView] = useState("login"); // 'login' or 'register'
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState("");

  const handleRegisterSuccess = () => {
    // 1. Set the success message banner text
    setRegistrationSuccessMessage("Registration successful! Please log in below.");
    // 2. Automatically slide them back over to the login view
    setView("login");
  };

  const handleToggleToRegister = () => {
    // Clear message when explicitly clicking out
    setRegistrationSuccessMessage("");
    setView("register");
  };

  return (
    <div className="auth-container">
      {view === "login" ? (
        <Login 
          onToggleView={handleToggleToRegister} 
          successMessage={registrationSuccessMessage}
          clearMessage={() => setRegistrationSuccessMessage("")}
        />
      ) : (
        <Register 
          onToggleView={() => setView("login")} 
          onRegisterSuccess={handleRegisterSuccess} 
        />
      )}
    </div>
  );
}

export default App;