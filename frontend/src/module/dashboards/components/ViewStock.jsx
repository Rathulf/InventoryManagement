import React, { useState, useEffect } from 'react';

export default function ViewStock() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/inventory')
      .then(res => res.json())
      .then(data => { setInventory(data); setIsLoading(false); })
      .catch(err => { console.error("Error:", err); setIsLoading(false); });
  }, []);

  return (
    <div className="inventory-section mt-0">
      <h3>Warehouse Stock Ledger</h3>
      {isLoading ? (
        <p className="empty-table-state">Loading inventory data...</p>
      ) : (
        <table className="ledger-table-view">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th className="center-cell">Price</th>
              <th className="center-cell">Quantity</th>
              <th className="center-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr><td colSpan="6" className="empty-table-state">No products found.</td></tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id}>
                  <td className="sku-cell">{item.sku}</td>
                  <td><strong>{item.name}</strong></td>
                  <td><span className="badge-cat">{item.category}</span></td>
                  <td className="center-cell">₱{item.price}</td>
                  <td className="center-cell">{item.quantity}</td>
                  <td className="center-cell">
                    {item.quantity > 10 ? <span className="normal-stock">In Stock</span> : <span className="danger-stock">Low Stock</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}