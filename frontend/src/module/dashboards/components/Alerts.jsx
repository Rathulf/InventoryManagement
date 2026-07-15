import React, { useState, useEffect } from 'react';

export default function Alerts() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reuse our existing inventory endpoint
    fetch('http://localhost:8080/api/inventory')
      .then(res => res.json())
      .then(data => {
        // Filter the data to only show items with less than 10 stock
        const criticalStock = data.filter(item => item.quantity < 10);
        setLowStockItems(criticalStock);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching alerts:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="inventory-section mt-0">
      <h3>System Alerts</h3>
      <p className="report-description">
        Monitor critical system notifications, low stock warnings, and required actions for your warehouse.
      </p>

      {isLoading ? (
        <p className="empty-table-state">Scanning system for alerts...</p>
      ) : lowStockItems.length === 0 ? (
        <div className="empty-alerts-placeholder">
          ✅ All systems nominal. No low stock alerts at this time.
        </div>
      ) : (
        <div className="alert-banner-container">
          <div className="alert-banner-header">
            ⚠️ Critical: Low Stock Warnings ({lowStockItems.length})
          </div>
          
          <div className="alert-items-stack">
            {lowStockItems.map(item => (
              <div key={item.id} className="alert-row-item">
                <div>
                  <strong>{item.name}</strong> (SKU: {item.sku}) is running critically low.
                  <br />
                  <span style={{ color: '#475569', fontSize: '13px' }}>
                    Current Quantity: <span style={{ fontWeight: '800', color: '#991b1b' }}>{item.quantity}</span>
                  </span>
                </div>
                
                {/* 
                  This button is currently visual. In the future, you could wire this 
                  up to open a modal that updates the item's quantity via a PUT request!
                */}
                <button className="restock-action-trigger">
                  + Restock Item
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}