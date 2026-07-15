import React from 'react';

export default function StaffDashboard({ inventory }) {
  return (
    <div className="main-content">
      <h2>Staff Operations</h2>
      <div className="quick-actions">
        <button className="commit-record-btn">Stock In</button>
        <button className="commit-record-btn">Stock Out</button>
      </div>
      
      <div className="inventory-section">
        <h3>Recent Transactions</h3>
      </div>
    </div>
  );
}