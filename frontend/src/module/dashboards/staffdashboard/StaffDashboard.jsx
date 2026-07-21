import React, { useState, useEffect, useRef } from 'react';

export default function StaffDashboard({ summary, threshold, setThreshold, onTransactionComplete }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fullInventory, setFullInventory] = useState([]);
  
  // Modal State Management
  const [showForm, setShowForm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [transactionType, setTransactionType] = useState('IN');
  const [transactionQty, setTransactionQty] = useState('');
  const [message, setMessage] = useState(null);

  // Custom searchable dropdown state
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
 
  const fetchInventory = () => {
    return fetch('https://stockpulse-cbdz.onrender.com/api/items')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch items");
        return res.json();
      })
      .then(data => {
        const inventoryData = Array.isArray(data) ? data : [];
        setFullInventory(inventoryData);
        return inventoryData;
      })
      .catch(err => {
        console.error("Error fetching inventory for search:", err);
        setFullInventory([]);
        return [];
      });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const openTransactionForm = (type) => {
    setSelectedItemId('');
    setDropdownSearch('');
    setTransactionType(type);
    setTransactionQty('');
    setMessage(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedItemId) {
      setMessage({ type: 'error', text: 'Please select a product.' });
      return;
    }

    const qtyNumber = parseInt(transactionQty, 10);
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive number.' });
      return;
    }

    const currentItem = fullInventory.find(i => i.id.toString() === selectedItemId.toString());
    if (transactionType === 'OUT' && currentItem && qtyNumber > currentItem.quantity) {
      setMessage({ type: 'error', text: 'Transaction failed: Insufficient stock!' });
      return;
    }

    try {
      const response = await fetch('https://stockpulse-cbdz.onrender.com/api/transactions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: parseInt(selectedItemId, 10),
          type: transactionType,
          quantity: qtyNumber,
          performedBy: 'Staff Member'
        })
      });

      if (!response.ok) throw new Error("Transaction Failed");

      setMessage({ type: 'success', text: 'Processed successfully!' });
      
      await Promise.all([
        fetchInventory(),
        onTransactionComplete ? onTransactionComplete() : Promise.resolve()
      ]);

      setTimeout(() => {
        setShowForm(false);
      }, 1000);

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const activeItem = fullInventory.find(i => i.id.toString() === selectedItemId.toString());

  // Filtered list for the custom searchable dropdown
  const filteredDropdownItems = fullInventory.filter(item =>
    item.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(dropdownSearch.toLowerCase()))
  );

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

      {/* STAFF OPERATIONS SECTION */}
      <div className="transactions-card" style={{ marginBottom: '24px' }}>
        <div className="operations-header">
          <h3 style={{ margin: '0 0 8px 0' }}>Staff Operations</h3>
          <p className="operations-desc">Record incoming deliveries or outgoing warehouse stock.</p>
        </div>
        <div className="action-buttons-container">
          <button 
            type="button" 
            className="btn-action btn-stock-in" 
            onClick={() => openTransactionForm('IN')}>
            📥 Stock In
          </button>
          <button 
            type="button" 
            className="btn-action btn-stock-out" 
            onClick={() => openTransactionForm('OUT')}>
            📤 Stock Out
          </button>
        </div>
      </div>

      {/* MAIN INVENTORY SECTION */}
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
     
      {/* POPUP MODAL OVERLAY */}
      {showForm && (
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
                {activeItem ? (
                  <>Selected: <strong>{activeItem.name}</strong> (Current Stock: {activeItem.quantity})</>
                ) : (
                  'Search and choose an item to process stock movement.'
                )}
              </p>
            </div>

            {message && (
              <div className={`message-box ${message.type === 'success' ? 'msg-success' : 'msg-error'}`}>
                {message.text}
              </div>
            )}

            <form className="stock-form" onSubmit={handleFormSubmit}>
              
              {/* SEARCHABLE & SCROLLABLE DROPDOWN */}
              <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
                <label>Select Product:</label>
                <div 
                  className="form-control" 
                  onClick={() => setIsDropdownOpen(true)}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}
                >
                  <span style={{ color: activeItem ? '#0f172a' : '#94a3b8' }}>
                    {activeItem ? `${activeItem.name} (SKU: ${activeItem.sku} - Stock: ${activeItem.quantity})` : '-- Search by name or SKU --'}
                  </span>
                  <span>▼</span>
                </div>

                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    marginTop: '4px'
                  }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="🔍 Type name or SKU to filter..."
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        autoFocus
                        style={{ margin: 0 }}
                      />
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {filteredDropdownItems.length === 0 ? (
                        <div style={{ padding: '10px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                          No matching products found
                        </div>
                      ) : (
                        filteredDropdownItems.map(item => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedItemId(item.id.toString());
                              setIsDropdownOpen(false);
                              setDropdownSearch('');
                            }}
                            style={{
                              padding: '10px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              fontSize: '14px',
                              backgroundColor: selectedItemId === item.id.toString() ? '#f8fafc' : 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedItemId === item.id.toString() ? '#f8fafc' : 'transparent'}
                          >
                            <strong>{item.name}</strong> <span style={{ color: '#64748b', fontSize: '12px' }}>({item.sku})</span> — Stock: {item.quantity}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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