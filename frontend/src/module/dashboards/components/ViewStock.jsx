import React, { useState, useEffect } from 'react';

export default function ViewStock() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/items')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch inventory");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setInventory(data);
        } else {
          setInventory([]);
        }
        // 1. Turn off loading screen when data successfully arrives!
        setIsLoading(false); 
      })
      .catch(err => {
        console.error("Error fetching inventory:", err);
        setInventory([]);
        // 2. Turn off loading screen even if it fails, so the app doesn't freeze!
        setIsLoading(false); 
      });
  }, []);

  return (
    <div className="inventory-section mt-0">
      <div className="creation-form-block">
        <h3>Warehouse Stock Ledger</h3>
        <p className="report-description">Current overview of all items in the warehouse.</p>

        {/* Show loading text if data is still fetching */}
        {isLoading ? (
          <p style={{ textAlign: 'center', marginTop: '40px', color: '#94a3b8' }}>
            <i>Loading inventory data...</i>
          </p>
        ) : inventory.length === 0 ? (
          /* Show this if the database is empty */
          <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
            <p style={{ color: '#64748b', margin: 0 }}>No inventory items found in the database.</p>
          </div>
        ) : (
          /* Show the inventory table when data is successfully loaded */
          <div style={{ overflowX: 'auto', marginTop: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', color: '#334155' }}>SKU</th>
                  <th style={{ padding: '12px', color: '#334155' }}>Product Name</th>
                  <th style={{ padding: '12px', color: '#334155' }}>Category</th>
                  <th style={{ padding: '12px', color: '#334155' }}>Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', color: '#475569', fontWeight: 'bold' }}>{item.sku}</td>
                    <td style={{ padding: '12px', color: '#0f172a' }}>{item.name}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{item.category || 'Uncategorized'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        // Highlight low stock items in red, normal stock in green
                        backgroundColor: item.quantity < 200 ? '#fee2e2' : '#d1fae5',
                        color: item.quantity < 200 ? '#b91c1c' : '#065f46',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {item.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}