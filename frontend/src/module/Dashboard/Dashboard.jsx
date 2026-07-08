import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch master stock registry data');
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalUniqueSkus = items.length;
  const totalStockVolume = items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const lowStockThreshold = 5;
  const criticalAlerts = items.filter(item => (item.qty || 0) <= lowStockThreshold).length;

  if (loading) {
    return (
      <div className="loading-screen">
        <p className="loading-text">Loading master stock telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <p className="error-title">API Connection Offline</p>
          <p className="error-subtitle">{error}</p>
          <button onClick={fetchInventory} className="btn-retry">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">StockPulse Hub Workspace</h1>
          <p className="header-subtitle">Real-time store stock control connected via Supabase REST API.</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchInventory} className="btn-secondary">
            Refresh
          </button>
          <button className="btn-primary">
            + Add New Item
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <p className="metric-label">Total Unique SKUs</p>
          <p className="metric-value">{totalUniqueSkus}</p>
        </div>
        
        <div className="metric-card">
          <p className="metric-label">Total Stock Volume</p>
          <p className="metric-value">{totalStockVolume} <span className="metric-unit">units</span></p>
        </div>

        <div className={`metric-card ${criticalAlerts > 0 ? 'alert-active' : ''}`}>
          <p className="metric-label">Critical Alerts</p>
          <p className="metric-value">
            {criticalAlerts} <span className="metric-unit">Items Low</span>
          </p>
        </div>
      </div>

      <div className="registry-container">
        <div className="registry-title-bar">
          <h3 className="registry-title">Master Stock Registry</h3>
        </div>

        {items.length === 0 ? (
          <div className="registry-empty">
            No items found in your inventory database. Click "+ Add New Item" to populate rows.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="registry-table">
              <thead className="table-head">
                <tr>
                  <th>Product Name</th>
                  <th>SKU Identifier</th>
                  <th>Stock Volume</th>
                  <th>Status Tracking</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isLow = (item.qty || 0) <= lowStockThreshold;
                  return (
                    <tr key={item.id} className="table-row">
                      <td className="cell-name">{item.name}</td>
                      <td className="cell-sku">{item.sku}</td>
                      <td className="cell-qty">{item.qty} units</td>
                      <td className="cell-status">
                        <span className={`badge ${isLow ? 'badge-alert' : 'badge-success'}`}>
                          {isLow ? 'Low Stock Alert' : 'Healthy / In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}