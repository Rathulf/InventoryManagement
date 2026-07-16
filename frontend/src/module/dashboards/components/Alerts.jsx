import React, { useState, useEffect } from 'react';

export default function Alerts() {
  // 1. Properly initialize both state variables
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetch the data when the component loads
  useEffect(() => {
    fetch('http://localhost:8080/api/items')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        // Safety check to ensure we received an array before trying to filter it
        if (Array.isArray(data)) {
          const lowStock = data.filter(item => item.quantity < 200);
          setAlerts(lowStock);
        } else {
          setAlerts([]);
        }
        // Turn off the loading text once data is ready
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching alerts:", err);
        setAlerts([]);
        // Turn off loading even if there is an error, so the app doesn't freeze
        setIsLoading(false);
      });
  }, []);

  // 3. Render the UI
  return (
    <div className="inventory-section mt-0">
      <div className="creation-form-block">
        <h3>System Alerts</h3>
        <p className="report-description">
          Monitor critical system notifications, low stock warnings, and required actions for your warehouse.
        </p>

        {/* Conditional Rendering: Show loading text, empty state, or the actual alerts */}
        {isLoading ? (
          <p style={{ textAlign: 'center', marginTop: '40px', color: '#94a3b8' }}>
            <i>Scanning system for alerts...</i>
          </p>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', backgroundColor: '#ecfdf5', borderRadius: '6px' }}>
            <h4 style={{ color: '#065f46', margin: 0 }}>✅ All Systems Nominal</h4>
            <p style={{ color: '#047857', marginTop: '8px' }}>No low stock warnings detected.</p>
          </div>
        ) : (
          <div style={{ marginTop: '24px' }}>
            {alerts.map(item => (
              <div 
                key={item.id} 
                style={{
                  padding: '16px',
                  marginBottom: '12px',
                  borderLeft: '4px solid #ef4444',
                  backgroundColor: '#fef2f2',
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#991b1b', fontSize: '16px' }}>
                    Low Stock Alert: {item.name}
                  </strong>
                  <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    SKU: {item.sku}
                  </span>
                </div>
                <p style={{ color: '#7f1d1d', marginTop: '8px', marginBottom: 0, fontSize: '14px' }}>
                  Current Quantity: <strong>{item.quantity}</strong> (Threshold: 200)
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}