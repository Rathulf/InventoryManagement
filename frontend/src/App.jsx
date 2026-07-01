import React, { useState } from 'react';
import Login from "./module/Login/Login";
import Register from "./module/Register/Register";
import "./assets/styles.css";

function App() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="auth-container">
      {isLoginView ? (
        <Login 
          onToggleView={() => setIsLoginView(false)} 
          onLoginSuccess={(user) => console.log("Logged in user context:", user)}
        />
      ) : (
        <Register 
          onToggleView={() => setIsLoginView(true)} 
          onRegisterSuccess={() => setIsLoginView(true)}
        />
      )}
    </div>
  );
}

export default App;