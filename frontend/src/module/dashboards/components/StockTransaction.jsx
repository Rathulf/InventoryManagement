import React, { useState, useEffect } from 'react';

export default function StockTransaction({ initialType = 'IN', isLocked = false }) {
  const [inventory, setInventory] = useState([]);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    itemId: '',
    type: initialType,
    quantity: '',
    performedBy: 'Staff Member'
  });

  useEffect(() => {
    // Updated to point to your live Render backend
    fetch('https://stockpulse-cbdz.onrender.com/api/items')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch items");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // FIX: Changed setFullInventory to setInventory to match your state hook
          setInventory(data);
        } else {
          setInventory([]);
        }
      })
      .catch(err => {
        console.error("Error fetching inventory for search:", err);
        setInventory([]); 
      });
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('https://stockpulse-cbdz.onrender.com/api/transactions/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        quantity: parseInt(formData.quantity, 10)
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Transaction Failed");
        setMessage({ type: 'success', text: 'Processed successfully!' });
        setFormData(prev => ({ ...prev, quantity: '' }));
      })
      .catch(err => setMessage({ type: 'error', text: err.message }));
  };

  return (
    <div style={{ width: '100%' }}>
      <h3>Process Stock Movement</h3>
      <p className="operations-desc">Record incoming shipments or outgoing orders.</p>

      {message && (
        <div className={`message-box ${message.type === 'success' ? 'msg-success' : 'msg-error'}`}>
          {message.text}
        </div>
      )}

      <form className="stock-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Product:</label>
          <select name="itemId" className="form-control" value={formData.itemId} onChange={handleInputChange} required>
            <option value="" disabled>-- Choose an Item --</option>
            {inventory.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Transaction Type:</label>
          <select 
            name="type" 
            className="form-control" 
            value={formData.type} 
            onChange={handleInputChange} 
            disabled={isLocked} 
            required
          >
            <option value="IN">Stock IN (Receiving)</option>
            <option value="OUT">Stock OUT (Dispatching)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Quantity:</label>
          <input type="number" name="quantity" className="form-control" placeholder="Enter amount" value={formData.quantity} onChange={handleInputChange} min="1" required />
        </div>
        
        <button type="submit" className={`submit-btn ${formData.type === 'IN' ? 'btn-in' : 'btn-out'}`}>
          Confirm {formData.type === 'IN' ? 'Stock In' : 'Stock Out'}
        </button>
      </form>
    </div>
  );
}