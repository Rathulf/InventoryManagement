import React, { useState, useEffect } from 'react';

export default function ViewStock() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('https://stockpulse-cbdz.onrender.com/api/items')
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

        {isLoading ? (
          <p className="table-state-msg msg-loading">Loading inventory data...</p>
        ) : inventory.length === 0 ? (
          <div className="table-state-msg msg-empty">
            <p>No inventory items found in the database.</p>
          </div>
        ) : (
          /* WRAPPED IN RESPONSIVE CONTAINER FOR SCROLLING */
          <div className="table-responsive-container">
            <table className="ledger-table-view">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th className="center-cell">Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="sku-cell">{item.sku}</td>
                    <td><strong>{item.name}</strong></td>
                    <td>
                      <span className="badge-cat">{item.category || 'Uncategorized'}</span>
                    </td>
                    <td className="center-cell">
                      <span className={item.quantity < 200 ? "danger-stock" : "normal-stock"}>
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