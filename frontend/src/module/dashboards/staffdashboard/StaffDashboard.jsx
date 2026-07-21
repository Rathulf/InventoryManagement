import React, { useState, useEffect } from 'react';

export default function StaffDashboard({ summary, threshold, setThreshold }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fullInventory, setFullInventory] = useState([]);
  
  // State variables for the modal overlay form
  const [showForm, setShowForm] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [transactionType, setTransactionType] = useState('IN');
  const [transactionQty, setTransactionQty] = useState('');
  const [message, setMessage] = useState(null);

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
        console.error("Error fetching inventory for search:", err);
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

  const openTransactionForm = (item, type) => {
    setActiveItem(item);
    setTransactionType(type);
    setTransactionQty('');
    setMessage(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const qtyNumber = parseInt(transactionQty, 10);
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive number.' });
      return;
    }

    if (transactionType === 'OUT' && qtyNumber > activeItem.quantity) {
      setMessage({ type: 'error', text: 'Transaction failed: Insufficient stock!' });
      return;
    }

    try {
      const response = await fetch('https://stockpulse-cbdz.onrender.com/api/transactions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: activeItem.id,
          type: transactionType,
          quantity: qtyNumber,
          performedBy: 'Staff Member'
        })
      });

      if (!response.ok) throw new Error("Transaction Failed");

      // Instantly update local inventory state
      setFullInventory(prev => prev.map(item => {
        if (item.id === activeItem.id) {
          return { 
            ...item, 
            quantity: transactionType === 'IN' ? item.quantity + qtyNumber : item.quantity - qtyNumber 
          };
        }
        return item;
      }));

      setMessage({ type: 'success', text: 'Processed successfully!' });
      setTimeout(() => {
        setShowForm(false);
      }, 1000);

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="inventory-section mt-0" style={{ position: 'relative', border: 'none', padding: 0, boxShadow: 'none', backgroundColor: 'transparent' }}>
      
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

        <div className="table-responsive-container">
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
                    <td className="center-cell">
                      <div className="action-buttons-container" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          className="btn-action btn-stock-in" 
                          onClick={() => openTransactionForm(item, 'IN')}>
                          Stock In
                        </button>
                        <button 
                          className="btn-action btn-stock-out" 
                          onClick={() => openTransactionForm(item, 'OUT')}>
                          Stock Out
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* POPUP MODAL OVERLAY USING GLOBAL CSS CLASSES */}
      {showForm && activeItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={() => setShowForm(false)}>
              &times;
            </button>
            
            <div className="operations-header">
              <h3>
                {transactionType === 'IN' ? 'Stock In (Receiving)' : 'Stock Out (Dispatching)'}
              </h3>
              <p className="operations-desc">
                Product: <strong>{activeItem.name}</strong> (Current: {activeItem.quantity})
              </p>
            </div>

            {message && (
              <div className={`message-box ${message.type === 'success' ? 'msg-success' : 'msg-error'}`}>
                {message.text}
              </div>
            )}

            <form className="stock-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Quantity:</label>
                <input 
                  type="number" 
                  name="quantity" 
                  className="form-control" 
                  placeholder="Enter amount" 
                  value={transactionQty} 
                  onChange={(e) => setTransactionQty(e.target.value)} 
                  min="1" 
                  required 
                  autoFocus 
                />
              </div>
              
              <button 
                type="submit" 
                className={`submit-btn ${transactionType === 'IN' ? 'btn-in' : 'btn-out'}`}>
                Confirm {transactionType === 'IN' ? 'Stock In' : 'Stock Out'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}