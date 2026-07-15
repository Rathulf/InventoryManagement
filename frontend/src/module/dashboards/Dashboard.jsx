import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./admindashboard/AdminDashboard";
import StaffDashboard from "./staffdashboard/StaffDashboard";
import ViewStock from "./components/ViewStock"; 
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
        {/* 2. Add the conditional rendering for ViewStock */}
        {view === 'Analytics' && <AdminDashboard summary={summary} />}
        {view === 'ViewStock' && <ViewStock />}
      </main>
    </div>
  );
}