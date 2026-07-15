import React, { useState, useEffect } from 'react';
import '../../assets/styles.css';

export default function Dashboard() {
  // Safe default initialization structures
  const [metrics, setMetrics] = useState({ totalItems: 0, uniqueSkus: 0, totalValuation: 0, topCategory: 'N/A' });
  const [inventoryList, setInventoryList] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form State for Adding New Items
  const [newItem, setNewItem] = useState({ sku: '', name: '', category: 'General', price: '', quantity: '', minThreshold: '' });

  // Centralized Data Sync Engine with structural array protection
  const refreshDashboardData = () => {
    fetch('http://localhost:8080/api/dashboard-analytics/metrics')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Guaranteeing object payload properties exist before shifting state
        if (data && typeof data === 'object') {
          setMetrics({
            totalItems: data.totalItems ?? 0,
            uniqueSkus: data.uniqueSkus ?? 0,
            totalValuation: data.totalValuation ?? 0,
            topCategory: data.topCategory ?? 'N/A'
          });
        }
      })
      .catch(err => console.error("Metrics sync failure", err));

    fetch('http://localhost:8080/api/dashboard-analytics/low-stock')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Enforce array baseline payload values
        setLowStock(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Alerts sync failure", err);
        setLowStock([]); // Defensive rollback to empty array state
      });

    fetch('http://localhost:8080/api/inventory')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Enforce array baseline payload values
        setInventoryList(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Ledger inventory sync failure", err);
        setInventoryList([]); // Defensive rollback to empty array state
      });
  };

  useEffect(() => {
    refreshDashboardData();
  }, []);

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!newItem.sku || !newItem.name) {
      alert("SKU Code and Asset Name fields are mandatory configuration variables.");
      return;
    }

    fetch('http://localhost:8080/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sku: newItem.sku,
        name: newItem.name,
        category: newItem.category,
        price: parseFloat(newItem.price) || 0.0,
        quantity: parseInt(newItem.quantity) || 0,
        minThreshold: parseInt(newItem.minThreshold) || 5
      })
    })
    .then(async (res) => {
      if (res.ok) {
        setNewItem({ sku: '', name: '', category: 'General', price: '', quantity: '', minThreshold: '' });
        refreshDashboardData();
      } else {
        const errorText = await res.text();
        alert(errorText || "Failed to commit asset record validation rules.");
      }
    })
    .catch(err => console.error("API error during creation runtime:", err));
  };

  const handleDeleteItemClick = (id, assetName) => {
    if (window.confirm(`Are you certain you want to purge ${assetName} permanently from the master registry?`)) {
      fetch(`http://localhost:8080/api/inventory/${id}`, { method: 'DELETE' })
        .then((res) => {
          if (res.ok) {
            refreshDashboardData();
          } else {
            alert("Failed to drop database record asset keys.");
          }
        })
        .catch(err => console.error("API error during context removal execution:", err));
    }
  };

  // Live Ledger Pipeline safeguarded against raw non-array properties mutations
  const safeInventory = Array.isArray(inventoryList) ? inventoryList : [];
  const filteredItems = safeInventory.filter(item => {
    if (!item) return false;
    const itemName = item.name ? item.name.toLowerCase() : '';
    const itemSku = item.sku ? item.sku.toLowerCase() : '';
    const itemCategory = item.category || 'General';

    const matchesSearch = itemName.includes(searchTerm.toLowerCase()) || 
                          itemSku.includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || itemCategory === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const safeLowStock = Array.isArray(lowStock) ? lowStock : [];

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">Operational Stock Analytics Dashboard</h2>

      {/* Metric Cards Layout Grid with deep null fallback protection */}
      <div className="metrics-layout-grid">
        <div className="metric-display-card item-count">
          <h4>Total Registered Items</h4>
          <p className="value">{metrics.totalItems ?? 0}</p>
        </div>
        <div className="metric-display-card sku-count">
          <h4>Unique Tracking SKUs</h4>
          <p className="value">{metrics.uniqueSkus ?? 0}</p>
        </div>
        <div className="metric-display-card finance-count">
          <h4>Gross Asset Valuation</h4>
          <p className="value">
            ₱{Number(metrics.totalValuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="metric-display-card category-count">
          <h4>Top Moving Category</h4>
          <p className="value">{metrics.topCategory || 'N/A'}</p>
        </div>
      </div>

      <div className="dashboard-split-layout">
        
        {/* Left Side: Forms and Inventory Ledger Tables */}
        <div className="split-left-panel">
          <div className="inventory-section creation-form-block">
            <h3>Provision New Inventory Registry Record</h3>
            <form onSubmit={handleAddItemSubmit} className="add-item-fluid-form">
              <input 
                type="text" placeholder="SKU Code" value={newItem.sku}
                onChange={e => setNewItem({...newItem, sku: e.target.value})} required 
              />
              <input 
                type="text" placeholder="Asset Name" value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})} required 
              />
              <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                <option value="General">General</option>
                <option value="Electronics">Electronics</option>
                <option value="Network Hardware">Network Hardware</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Utilities">Utilities</option>
                <option value="Consumables">Consumables</option>
              </select>
              <input type="number" step="0.01" placeholder="Price (₱)" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
              <input type="number" placeholder="Initial Qty" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} />
              <input type="number" placeholder="Min Threshold" value={newItem.minThreshold} onChange={e => setNewItem({...newItem, minThreshold: e.target.value})} />
              <button type="submit" className="commit-record-btn">Commit Asset</button>
            </form>
          </div>

          <div className="inventory-section">
            <h3>Master Product Registry Ledger</h3>
            <div className="search-filter-controls-bar">
              <input 
                type="text" placeholder="Search by title or SKU references..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} className="search-input-box"
              />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="category-dropdown-selector">
                <option value="All">All Item Categories</option>
                <option value="General">General</option>
                <option value="Electronics">Electronics</option>
                <option value="Network Hardware">Network Hardware</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Utilities">Utilities</option>
                <option value="Consumables">Consumables</option>
              </select>
            </div>

            <table className="ledger-table-view">
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>Unit Pricing</th>
                  <th>Stock Volume</th>
                  <th className="center-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td className="sku-cell">{item.sku}</td>
                    <td><strong>{item.name}</strong></td>
                    <td><span className="badge-cat">{item.category || 'General'}</span></td>
                    <td>₱{Number(item.price || 0).toFixed(2)}</td>
                    <td className={item.quantity <= (item.minThreshold || 5) ? "danger-stock" : "normal-stock"}>
                      {item.quantity || 0} units
                    </td>
                    <td className="center-cell">
                      <button className="ledger-row-purge-btn" onClick={() => handleDeleteItemClick(item.id, item.name)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-table-state">No inventory items match your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Information Panels & Warning Feeds */}
        <div className="split-right-panel">
          <div className="notification-card-container">
            <div className="notification-card-header">
              <span className="bell-icon">🔔</span>
              <h4>System Notifications</h4>
            </div>
            <div className="notification-card-body">
              {safeLowStock.length > 0 ? (
                <p className="notification-alert-text">
                  Attention Admin: There are currently <strong>{safeLowStock.length}</strong> items running below their safe minimum threshold limits.
                </p>
              ) : (
                <p className="notification-success-text">
                  All systems operational. No critical threshold alerts detected.
                </p>
              )}
            </div>
          </div>

          {safeLowStock.length > 0 ? (
            <div className="alert-banner-container">
              <div className="alert-banner-header">⚠️ Critical Low Stock Warnings</div>
              <div className="alert-items-stack">
                {safeLowStock.map(item => (
                  <div key={item.id} className="alert-row-item">
                    <span>📦 <strong>{item.name}</strong> ({item.sku}) has dropped to <strong>{item.quantity}</strong> units.</span>
                    <button className="restock-action-trigger" onClick={() => alert(`Restock request triggered for: ${item.sku}`)}>Quick Restock</button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-alerts-placeholder">
              ✅ All stock volumes are healthy and above operational thresholds.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}