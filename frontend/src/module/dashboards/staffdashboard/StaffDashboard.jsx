import React, { useState, useEffect } from 'react';

export default function StaffDashboard({ summary, threshold, setThreshold }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fullInventory, setFullInventory] = useState([]);
  
  useEffect(() => {
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
        console.error("Error fetching inventory:", err);
        setFullInventory([]); 
      });
  }, []);

  const totalProducts = summary?.totalProducts || 0;
  const lowStock = summary?.lowStock || 0;
  const lowStockProducts = summary?.lowStockProducts || [];

  const displayedItems = searchQuery.trim() === '' 
    ? lowStockProducts 
    : fullInventory.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // THE FIX: Directly connecting your dashboard buttons to your transaction API
  const processTransaction = async (itemId, type) => {
    const itemToUpdate = fullInventory.find(item => item.id === itemId);
    if (!itemToUpdate) return;

    // Ask the staff member for the quantity
    const inputQty = window.prompt(`How many items would you like to ${type === 'IN' ? 'ADD to' : 'REMOVE from'} ${itemToUpdate.name}?`);
    if (!inputQty) return; 

    const qtyNumber = parseInt(inputQty, 10);
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    // Prevent negative stock
    if (type === 'OUT' && qtyNumber > itemToUpdate.quantity) {
      alert("Transaction failed: Insufficient stock!");
      return;
    }

    try {
      // Sending the exact payload your Spring Boot transaction endpoint requires
      const response = await fetch('https://stockpulse-cbdz.onrender.com/api/transactions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: itemId,
          type: type,
          quantity: qtyNumber,
          performedBy: 'Staff Member'
        })
      });

      if (response.ok) {
        // Instantly update the UI without needing to refresh the page
        setFullInventory(prev => prev.map(item => {
          if (item.id === itemId) {
            return { 
              ...item, 
              quantity: type === 'IN' ? item.quantity + qtyNumber : item.quantity - qtyNumber 
            };
          }
          return item;
        }));
      } else {
        alert(`Transaction failed. Server Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Could not reach the database.");
    }
  };

  return (
    <div className="inventory-section mt-0">
      
      {/* METRICS CARDS */}
      <div className="metrics-layout-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="metric-display-card item-count">
          <h4>Total Products</h4>
          <p className="value">{totalProducts}</p>
        </div>
        <div className="metric-display-card category-count">
          <h4>Low Stock</h4>
          <p className="value">{lowStock}</p>
        </div>
      </div>

      <div className="inventory-section">
        
        {/* DYNAMIC CONTROLS BAR: Threshold Setting + Search Bar */}
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
              <th className="center-cell">Actions</th> 
            </tr>
          </thead>
          <tbody>
            {displayedItems.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-table-state"> 
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
                  <td className={`center-cell ${item.quantity < threshold ? 'danger-stock' : 'normal-stock'}`} style={{ display: 'table-cell' }}>
                    {item.quantity}
                  </td>
                  {/* Action buttons connected to your transaction endpoint */}
                  <td className="center-cell" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                        className="btn-stock-in" 
                        style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => processTransaction(item.id, 'IN')}>
                        Stock In
                    </button>
                    <button 
                        className="btn-stock-out" 
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => processTransaction(item.id, 'OUT')}>
                        Stock Out
                    </button>
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