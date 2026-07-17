import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./admindashboard/AdminDashboard";
import StaffDashboard from "./staffdashboard/StaffDashboard";
import ViewStock from "./components/ViewStock";
import ManageStock from "./components/ManageStock"; 
import ManageEmployees from "./components/ManageEmployees";
import GenerateReport from "./components/GenerateReport";
import Alerts from "./components/Alerts";
import AuditLogs from "./components/AuditLogs";
import "../../assets/styles.css"; 

export default function Dashboard() {
  const [view, setView] = useState('Analytics');
  const [summary, setSummary] = useState(null);
  
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'Staff');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');

  const [lowStockThreshold, setLowStockThreshold] = useState(200); //default threshold value

  useEffect(() => {
    if (view === 'Analytics') {
      fetch(`https://stockpulse-cbdz.onrender.com/api/dashboard/summary?threshold=${lowStockThreshold}`)
        .then(res => res.json())
        .then(data => setSummary(data))
        .catch(err => console.error("Error fetching data:", err));
    }
  }, [view, lowStockThreshold]);

  return (
    <div className="dashboard-wrapper"> 
      <Sidebar 
        setView={setView} 
        userRole={userRole} 
        userName={userName} 
        currentView={view} 
      />
      
      <main className="main-content">
        {view === 'Analytics' && userRole === 'Admin' && (
          <AdminDashboard summary={summary} threshold={lowStockThreshold} setThreshold={setLowStockThreshold} />
        )}
        {view === 'Analytics' && userRole === 'Staff' && (
          <StaffDashboard summary={summary} threshold={lowStockThreshold} setThreshold={setLowStockThreshold} />
        )}
        {view === 'ViewStock' && <ViewStock threshold={lowStockThreshold} />}
        {view === 'Alerts' && <Alerts threshold={lowStockThreshold} />} 
        {view === 'ManageStock' && userRole === 'Admin' && <ManageStock />}
        {view === 'ManageEmployees' && userRole === 'Admin' && <ManageEmployees />}
        {view === 'Reports' && userRole === 'Admin' && <GenerateReport />} 
        {view === 'AuditLogs' && userRole === 'Admin' && <AuditLogs />} 
      </main>
    </div>
  );
}