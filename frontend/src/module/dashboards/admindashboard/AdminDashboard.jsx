import React from 'react';

export default function AdminDashboard({ summary }) {
  // If summary is still loading, we provide safe fallback values (0)
  const totalProducts = summary?.totalProducts || 0;
  const lowStock = summary?.lowStock || 0;
  const totalValue = summary?.totalValue || 0;
  const lowStockProducts = summary?.lowStockProducts || [];

  return (
    <div className="inventory-section mt-0">
      
      {/* METRICS CARDS */}
      <div className="metrics-layout-grid">
        <div className="metric-display-card item-count">
          <h4>Total Products</h4>
          <p className="value">{totalProducts}</p>
        </div>
        
        <div className="metric-display-card category-count">
          <h4>Low Stock</h4>
          <p className="value">{lowStock}</p>
        </div>
        
        <div className="metric-display-card finance-count">
          <h4>Total Value</h4>
          {/* Format the number to show commas and 2 decimal places */}
          <p className="value">₱{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* LOW STOCK TABLE */}
      <div className="inventory-section">
        <h3>Low Stock Products</h3>
        <table className="ledger-table-view">
          <thead>
            <tr>
              <th>Product</th>
              <th className="center-cell">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.length === 0 ? (
              <tr>
                <td colSpan="2" className="empty-table-state">No low stock items. Everything is looking good!</td>
              </tr>
            ) : (
              lowStockProducts.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong> <span style={{ color: '#64748b', fontSize: '12px' }}>({item.sku})</span></td>
                  <td className="center-cell danger-stock" style={{ display: 'table-cell' }}>{item.quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}