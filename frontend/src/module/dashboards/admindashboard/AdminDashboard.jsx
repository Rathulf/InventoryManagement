import React, { useState, useEffect } from 'react';

// 1. Accept the threshold and setThreshold props
export default function AdminDashboard({ summary, threshold, setThreshold }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fullInventory, setFullInventory] = useState([]);
  
  useEffect(() => {
  // Updated to point to your live Render backend
  fetch('https://stockpulse-cbdz.onrender.com/api/items')
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        setFullInventory(data);
      } else {
        setFullInventory([]);
      }
    })
    .catch(err => {
      console.error("Error fetching inventory for search:", err);
      setFullInventory([]); 
    });
}, []);

  const totalProducts = summary?.totalProducts || 0;
  const lowStock = summary?.lowStock || 0;
  const totalValue = summary?.totalValue || 0;
  const lowStockProducts = summary?.lowStockProducts || [];

  const displayedItems = searchQuery.trim() === '' 
    ? lowStockProducts 
    : fullInventory.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      );

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
          <p className="value">₱{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="inventory-section">
        
        {/* 2. DYNAMIC CONTROLS BAR: Threshold Setting + Search Bar */}
        <div className="search-filter-controls-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
              Low Stock Threshold:
            </label>
            <input 
              type="number" 
              className="search-input-box" 
              value={threshold}
              onChange={(e) => setThreshold(Math.max(1, Number(e.target.value)))}
              style={{ width: '80px', padding: '8px 12px', margin: 0 }}
              min="1"
            />
          </div>

          <input 
            type="text" 
            className="search-input-box" 
            placeholder="🔍 Search by product name or SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: '300px', margin: 0 }}
          />
        </div>

        <table className="ledger-table-view">
          <thead>
            <tr>
              <th>Product</th>
              <th className="center-cell">Stock Level</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.length === 0 ? (
              <tr>
                <td colSpan="2" className="empty-table-state">
                  {searchQuery.trim() === '' 
                    ? `No items with stock below ${threshold}. Everything is looking good!` 
                    : `No items found matching "${searchQuery}"`}
                </td>
              </tr>
            ) : (
              displayedItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong> <span style={{ color: '#64748b', fontSize: '12px' }}>({item.sku})</span>
                  </td>
                  {/* 3. Apply color styling based on the dynamic threshold */}
                  <td className={`center-cell ${item.quantity < threshold ? 'danger-stock' : 'normal-stock'}`} style={{ display: 'table-cell' }}>
                    {item.quantity}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}