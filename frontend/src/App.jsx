import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./module/Login/Login.jsx";
import Register from "./module/Register/Register.jsx";
import Dashboard from "./module/Dashboard/Dashboard.jsx";
import "./assets/styles.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />}/>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;