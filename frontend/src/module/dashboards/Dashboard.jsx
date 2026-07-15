import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./admindashboard/AdminDashboard";
import StaffDashboard from "./staffdashboard/StaffDashboard";
import "../../assets/styles.css"; 

export default function Dashboard() {
  const [view, setView] = useState('Analytics');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/dashboard/summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  return (
    <div className="dashboard-wrapper"> 
      <Sidebar setView={setView} userRole="Admin" currentView={view} />
      
      <main className="main-content">
        {view === 'Analytics' && <AdminDashboard summary={summary} />}
      </main>
    </div>
  );
}