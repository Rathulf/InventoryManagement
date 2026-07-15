import React from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Accept the userName prop
const Sidebar = ({ setView, userRole, userName, currentView }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 2. Clear the user's session data from the browser when they log out
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">StockPulse Hub</h2>
        
        {/* 3. Display the personalized greeting */}
        <p className="sidebar-role" style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '15px', marginTop: '12px' }}>
          Welcome, {userName}
        </p>
        <p className="sidebar-role">Role: {userRole}</p>
      </div>

      <ul className="sidebar-nav">
        <li className={currentView === 'Analytics' ? 'active' : ''} onClick={() => setView('Analytics')}>📊 Analytics Overview</li>
        <li className={currentView === 'ViewStock' ? 'active' : ''} onClick={() => setView('ViewStock')}>👁️ View Warehouse Stock</li>
        
        {userRole === 'Admin' && (
          <>
            <li className={currentView === 'ManageStock' ? 'active' : ''} onClick={() => setView('ManageStock')}>🛠️ Manage Inventory</li>
            <li className={currentView === 'ManageEmployees' ? 'active' : ''} onClick={() => setView('ManageEmployees')}>👥 Manage Employees</li>
            <li className={currentView === 'Reports' ? 'active' : ''} onClick={() => setView('Reports')}>📝 Generate Reports</li>
          </>
        )}
        
        <li className={currentView === 'Alerts' ? 'active' : ''} onClick={() => setView('Alerts')}>🔔 System Alerts</li>
      </ul>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Sidebar;