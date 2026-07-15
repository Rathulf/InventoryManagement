import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ setView, userRole, currentView }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      <div style={{ paddingBottom: '20px' }}>
        <h2 style={{ color: '#38bdf8', fontSize: '20px' }}>StockPulse Hub</h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Role: {userRole}</p>
      </div>

      <ul className="sidebar-nav">
        <li 
          className={currentView === 'Analytics' ? 'active' : ''} 
          onClick={() => setView('Analytics')}>📊 Analytics Overview
        </li>
        
        <li 
          className={currentView === 'ViewStock' ? 'active' : ''} 
          onClick={() => setView('ViewStock')}>👁️ View Warehouse Stock
        </li>

        {userRole === 'Admin' && (
          <>
            <li 
              className={currentView === 'ManageStock' ? 'active' : ''} 
              onClick={() => setView('ManageStock')}>🛠️ Manage Inventory
            </li>
            <li 
              className={currentView === 'Reports' ? 'active' : ''} 
              onClick={() => setView('Reports')}>📝 Generate Reports
            </li>
          </>
        )}

        <li 
          className={currentView === 'Alerts' ? 'active' : ''} 
          onClick={() => setView('Alerts')}>🔔 System Alerts
        </li>
      </ul>

      {/* Logout button anchored to bottom */}
      <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
        <button 
          onClick={handleLogout}
          style={{ 
            background: 'transparent', 
            border: '1px solid #475569', 
            color: '#94a3b8', 
            padding: '8px 16px', 
            borderRadius: '6px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;