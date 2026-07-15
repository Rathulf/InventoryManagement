import React from 'react';
import '../../../assets/styles.css';

export default function StaffDashboard({ inventory, lowStock }) {
  return (
    <div className="main-content">
      <h2 className="dashboard-title">Warehouse Staff Operations</h2>

      {/* 1. Urgent Low-Stock Alerts Section */}
      <div className="inventory-section" style={{ marginBottom: '24px' }}>
        <h3>⚠️ Priority Restock Alerts</h3>
        {Array.isArray(lowStock) && lowStock.length > 0 ? (
          <div className="alert-items-stack">
            {lowStock.map(item => (
              <div key={item.id} className="alert-row-item" style={{ borderBottom: '1px solid #fee2e2' }}>
                <span>📦 <strong>{item.name}</strong> is critically low ({item.quantity} remaining).</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-alerts-placeholder">✅ All stock levels are currently within safe operational limits.</div>
        )}
      </div>

      {/* 2. Read-Only Inventory Ledger */}
      <div className="inventory-section">
        <h3>Live Warehouse Inventory</h3>
        <table className="ledger-table-view">
          <thead>
            <tr>
              <th>SKU Code</th>
              <th>Asset Name</th>
              <th>Category</th>
              <th>Stock Volume</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(inventory) && inventory.map(item => (
              <tr key={item.id}>
                <td className="sku-cell">{item.sku}</td>
                <td>{item.name}</td>
                <td><span className="badge-cat">{item.category}</span></td>
                <td>{item.quantity} units</td>
                <td>
                  {item.quantity <= (item.minThreshold || 5) ? 
                    <span className="danger-stock">Restock Needed</span> : 
                    <span className="normal-stock">Optimal</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}