import React from 'react';

export default function AdminDashboard({ summary }) {
  // Defensive check: If summary is null/undefined, show a loading state
  if (!summary) {
    return <div className="main-content">Loading dashboard data...</div>;
  }

  return (
    <div className="main-content">
      <div className="metrics-layout-grid">
        <div className="metric-display-card">
          <h4>Total Products</h4>
          <p className="value">{summary.totalProducts ?? 0}</p>
        </div>
        <div className="metric-display-card">
          <h4>Low Stock</h4>
          <p className="value">{summary.lowStockCount ?? 0}</p>
        </div>
        <div className="metric-display-card">
          <h4>Total Value</h4>
          {/* Defensive rendering: ensures toLocaleString only runs if the number exists */}
          <p className="value">₱{summary.totalValue ? summary.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</p>
        </div>
      </div>
      
      <div className="inventory-section">
        <h3>Low Stock Products</h3>
        <table className="ledger-table-view">
          <thead>
            <tr><th>Product</th><th>Quantity</th></tr>
          </thead>
          <tbody>
            {/* Add your logic here to map inventory items */}
          </tbody>
        </table>
      </div>
    </div>
  );
}