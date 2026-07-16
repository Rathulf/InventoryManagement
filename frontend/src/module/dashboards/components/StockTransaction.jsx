import React, { useState, useEffect } from 'react';

export default function StockTransaction() {
  const [inventory, setInventory] = useState([]);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    itemId: '',
    type: 'IN',
    quantity: '',
    performedBy: 'Staff Member'
  });

  useEffect(() => {
   fetch('http://localhost:8080/api/items')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch inventory");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setInventory(data);
      })
      .catch(err => {
        console.error("Error fetching inventory:", err);
        setMessage({ type: 'error', text: 'Could not load inventory items.' });
      });
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.itemId) {
      setMessage({ type: 'error', text: 'Please select a product from the dropdown.' });
      return;
    }
    if (!formData.quantity || formData.quantity < 1) {
      setMessage({ type: 'error', text: 'Please enter a valid quantity of 1 or more.' });
      return;
    }

    fetch('http://localhost:8080/api/transactions/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: formData.itemId,
        type: formData.type,
        quantity: parseInt(formData.quantity, 10),
        performedBy: formData.performedBy
      })
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(text);
        
        setMessage({ type: 'success', text: 'Transaction processed successfully!' });
        setFormData({ ...formData, quantity: '' });
        
        fetch('http://localhost:8080/api/items')
          .then(r => r.json())
          .then(d => { if (Array.isArray(d)) setInventory(d); });
      })
      .catch(err => {
        console.error("Transaction Error:", err);
        setMessage({ type: 'error', text: err.message || 'Failed to process transaction.' });
      });
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Cleaned up header without the extra box border */}
      <h3 style={{ marginBottom: '8px', color: '#0f172a', fontSize: '20px' }}>Process Stock Movement</h3>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>Record incoming shipments or outgoing orders.</p>

      {message && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '20px', 
          borderRadius: '6px',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#34d399' : '#f87171'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Changed to Flex Column to perfectly stack the labels and inputs */}
      <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
        
        <label style={{ fontWeight: '600', color: '#475569', marginBottom: '6px', fontSize: '13px' }}>Select Product:</label>
        <select 
          name="itemId" 
          value={formData.itemId} 
          onChange={handleInputChange} 
          style={{ width: '100%', marginBottom: '20px', padding: '12px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc' }}
        >
          <option value="" disabled>-- Choose an Item --</option>
          {inventory.map(item => (
            <option key={item.id} value={item.id}>
              {item.sku} | {item.name} (Current Stock: {item.quantity})
            </option>
          ))}
        </select>

        <label style={{ fontWeight: '600', color: '#475569', marginBottom: '6px', fontSize: '13px' }}>Transaction Type:</label>
        <select 
          name="type" 
          value={formData.type} 
          onChange={handleInputChange} 
          style={{ width: '100%', marginBottom: '20px', padding: '12px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc' }}
        >
          <option value="IN">Stock IN (Receiving)</option>
          <option value="OUT">Stock OUT (Dispatching)</option>
        </select>

        <label style={{ fontWeight: '600', color: '#475569', marginBottom: '6px', fontSize: '13px' }}>Quantity:</label>
        <input 
          type="number" 
          name="quantity" 
          placeholder="Amount to move" 
          value={formData.quantity} 
          onChange={handleInputChange} 
          min="1" 
          style={{ width: '100%', marginBottom: '32px', padding: '12px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc' }}
        />
        
        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '14px', 
            fontSize: '15px', 
            fontWeight: '600',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            backgroundColor: formData.type === 'IN' ? '#10b981' : '#f59e0b' 
          }}
        >
          {formData.type === 'IN' ? '📥 Confirm Stock In' : '📤 Confirm Stock Out'}
        </button>
      </form>
    </div>
  );
}