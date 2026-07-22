import React, { useState, useEffect, useMemo } from 'react';
import { useDashboardFilter } from '../../hooks/useDashboardFilter'; // Check this path

export default function ViewStock({ threshold = 200 }) {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hook initialized WITHOUT threshold so it displays all items
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredData,
  } = useDashboardFilter(inventory);

  const uniqueCategories = useMemo(() => {
    const categories = inventory.map(item => item.category || 'Uncategorized');
    return [...new Set(categories)]; 
  }, [inventory]);

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
        
        <div className="operations-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Warehouse Stock Ledger</h3>
            <p className="report-description mt-0" style={{ marginBottom: 0 }}>
              Current overview of all items in the warehouse.
            </p>
          </div>
          
          <div className="search-filter-controls-bar" style={{ marginBottom: 0, flexWrap: 'wrap' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-dropdown-selector"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search SKU, Name, or Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-box"
              style={{ minWidth: '260px' }}
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
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="sku-cell">{item.sku}</td>
                      <td><strong>{item.name}</strong></td>
                      <td>
                        <span className="badge-cat">{item.category || 'Uncategorized'}</span>
                      </td>
                      <td className="center-cell">
                        {/* Threshold prop is still correctly used here for styling */}
                        <span className={item.quantity <= threshold ? "danger-stock" : "normal-stock"}>
                          {item.quantity}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="center-cell" style={{ padding: '20px', color: '#666' }}>
                      No items match your selected filters.
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