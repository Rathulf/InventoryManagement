import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ setView, userRole, currentView }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">StockPulse Hub</h2>
        <p className="sidebar-role">Role: {userRole}</p>
      </div>

      <ul className="sidebar-nav">
        <li className={currentView === 'Analytics' ? 'active' : ''} onClick={() => setView('Analytics')}>📊 Analytics Overview</li>
        <li className={currentView === 'ViewStock' ? 'active' : ''} onClick={() => setView('ViewStock')}>👁️ View Warehouse Stock</li>
        
        {userRole === 'Admin' && (
          <>
            <li className={currentView === 'ManageStock' ? 'active' : ''} onClick={() => setView('ManageStock')}>🛠️ Manage Inventory</li>
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