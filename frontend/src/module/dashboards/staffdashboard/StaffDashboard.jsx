import React from 'react';

export default function StaffDashboard() {
  return (
    <div className="inventory-section mt-0">
      
      {/* HEADER & OPERATIONS */}
      <h3>Staff Operations</h3>
      <p className="report-description" style={{ marginBottom: '20px' }}>
        Record incoming deliveries or outgoing warehouse stock.
      </p>
      
      {/* FLEXBOX CONTAINER FOR BUTTONS */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
        <button 
          className="commit-record-btn" 
          style={{ 
            backgroundColor: '#10b981', /* Green for Stock In */
            borderColor: '#10b981',
            width: 'auto', 
            padding: '10px 24px' 
          }}
        >
          📥 Stock In
        </button>
        
        <button 
          className="commit-record-btn" 
          style={{ 
            backgroundColor: '#f59e0b', /* Orange/Amber for Stock Out */
            borderColor: '#f59e0b',
            width: 'auto', 
            padding: '10px 24px' 
          }}
        >
          📤 Stock Out
        </button>
      </div>

      <hr className="section-divider" />

      {/* TRANSACTIONS TABLE */}
      <div className="inventory-section">
        <h3>Recent Transactions</h3>
        
        <table className="ledger-table-view">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Product (SKU)</th>
              <th className="center-cell">Quantity Adjusted</th>
            </tr>
          </thead>
          <tbody>
            {/* Placeholder for when you wire up the backend logs */}
            <tr>
              <td colSpan="4" className="empty-table-state">
                No recent transactions recorded today.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </div>
  );
}