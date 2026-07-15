import React, { useState, useEffect } from 'react';

export default function ManageStock() {
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Electronics',
    price: '',
    quantity: ''
  });

  // Fetch items on load to populate the management table
  const fetchInventory = () => {
    fetch('http://localhost:8080/api/inventory')
      .then(res => res.json())
      .then(data => setInventory(data))
      .catch(err => console.error("Error fetching inventory:", err));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle typing in the form fields
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission (POST)
  const handleAddItem = (e) => {
    e.preventDefault(); // Prevent page reload
    fetch('http://localhost:8080/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to add item");
        return res.json();
      })
      .then(() => {
        fetchInventory(); // Refresh the table
        setFormData({ sku: '', name: '', category: 'Electronics', price: '', quantity: '' }); // Clear form
      })
      .catch(err => console.error("Error adding item:", err));
  };

  // Handle item deletion (DELETE)
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to purge this record?")) return;

    fetch(`http://localhost:8080/api/inventory/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete item");
        fetchInventory(); // Refresh the table after deletion
      })
      .catch(err => console.error("Error deleting item:", err));
  };

  return (
    <div className="inventory-section" style={{ marginTop: 0 }}>
      
      {/* ADD ITEM FORM */}
      <div className="creation-form-block">
        <h3>Add New Product</h3>
        <form className="add-item-fluid-form" onSubmit={handleAddItem}>
          <input type="text" name="sku" placeholder="SKU (e.g. LAP-001)" value={formData.sku} onChange={handleInputChange} required />
          <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleInputChange} required />
          
          <select name="category" value={formData.category} onChange={handleInputChange} required>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Supplies">Supplies</option>
            <option value="Hardware">Hardware</option>
          </select>
          
          <input type="number" name="price" placeholder="Price (₱)" value={formData.price} onChange={handleInputChange} min="0" step="0.01" required />
          <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleInputChange} min="0" required />
          
          <button type="submit" className="commit-record-btn">+ Add Record</button>
        </form>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />

      {/* MANAGE ITEMS TABLE */}
      <h3>Manage Existing Stock</h3>
      <table className="ledger-table-view">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th className="center-cell">Stock</th>
            <th className="center-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.length === 0 ? (
            <tr>
              <td colSpan="4" className="empty-table-state">No products to manage.</td>
            </tr>
          ) : (
            inventory.map((item) => (
              <tr key={item.id}>
                <td className="sku-cell">{item.sku}</td>
                <td><strong>{item.name}</strong></td>
                <td className="center-cell">{item.quantity}</td>
                <td className="center-cell">
                  <button onClick={() => handleDelete(item.id)} className="ledger-row-purge-btn">
                    Purge
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}