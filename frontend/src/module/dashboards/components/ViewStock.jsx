import React, { useState, useEffect } from 'react';
import { useDashboardFilter } from '../../hooks/useDashboardFilter';

export default function ViewStock({ threshold = 200 }) {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initialize the custom filter hook with your fetched data
  const {
    searchQuery,
    setSearchQuery,
    filteredData,
  } = useDashboardFilter(inventory, threshold);

  useEffect(() => {
    fetch('https://stockpulse-cbdz.onrender.com/api/items')
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch inventory");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setInventory(data);
        } else {
          setInventory([]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching inventory:", err);
        setInventory([]);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="inventory-section mt-0">
      <div className="creation-form-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3>Warehouse Stock Ledger</h3>
            <p className="report-description">Current overview of all items in the warehouse.</p>
          </div>
          
          {/* 2. Add the search input field connected to the hook */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search SKU, Name, or Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
            />
          </div>
        </div>

        {isLoading ? (
          <p className="table-state-msg msg-loading">Loading inventory data...</p>
        ) : inventory.length === 0 ? (
          <div className="table-state-msg msg-empty">
            <p>No inventory items found in the database.</p>
          </div>
        ) : (
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
                {/* 3. Map over filteredData instead of the raw inventory */}
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="sku-cell">{item.sku}</td>
                      <td><strong>{item.name}</strong></td>
                      <td>
                        <span className="badge-cat">{item.category || 'Uncategorized'}</span>
                      </td>
                      <td className="center-cell">
                        {/* Use the dynamic threshold prop for the warning class */}
                        <span className={item.quantity <= threshold ? "danger-stock" : "normal-stock"}>
                          {item.quantity}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="center-cell" style={{ padding: '20px', color: '#666' }}>
                      No items match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}