import React, { useState, useEffect, useMemo } from 'react';
import { useDashboardFilter } from '../../hooks/useDashboardFilter'; // Check this path

export default function ManageStock() {
  const [inventory, setInventory] = useState([]);
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Electronics',
    price: '',
    quantity: '',
    threshold: 200 
  });

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

  const fetchInventory = () => {
    fetch('https://stockpulse-cbdz.onrender.com/api/items')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setInventory(data);
        } else {
          setInventory([]);
        }
      })
      .catch(err => {
        console.error("Error fetching inventory:", err);
        setInventory([]); 
      });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddItem = (e) => {
    e.preventDefault(); 
    fetch('https://stockpulse-cbdz.onrender.com/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to add item");
        return res.json();
      })
      .then(() => {
        fetchInventory(); 
        setFormData({ 
          sku: '', 
          name: '', 
          category: 'Electronics', 
          price: '', 
          quantity: '', 
          threshold: 200 
        }); 
      })
      .catch(err => console.error("Error adding item:", err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to purge this record?")) return;
    fetch(`https://stockpulse-cbdz.onrender.com/api/items/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete item");
        fetchInventory(); 
      })
      .catch(err => console.error("Error deleting item:", err));
  };

  return (
    <div className="inventory-section mt-0">
      
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
          <input type="number" name="threshold" placeholder="Low Stock Threshold" value={formData.threshold} onChange={handleInputChange} min="0" required />
          
          <button type="submit" className="commit-record-btn">+ Add Record</button>
        </form>
      </div>

      <hr className="section-divider" />

      {/* --- HEADER & FILTER SECTION --- */}
      <div className="operations-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Manage Existing Stock</h3>
          <p className="report-description mt-0" style={{ marginBottom: 0 }}>
            Update, modify, or remove existing warehouse records.
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
      
      <div className="table-responsive-container">
        <table className="ledger-table-view">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th className="center-cell">Stock</th>
              <th className="center-cell">Threshold</th>
              <th className="center-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-table-state">
                  {inventory.length === 0 
                    ? "No products to manage." 
                    : "No items match your selected filters."}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="sku-cell">{item.sku}</td>
                  <td><strong>{item.name}</strong></td>
                  
                  <td className="center-cell">
                    <span className={item.quantity <= item.threshold ? "danger-stock" : "normal-stock"}>
                      {item.quantity}
                    </span>
                  </td>
                  
                  <td className="center-cell">{item.threshold}</td>
                  <td className="center-cell">
                    <button onClick={() => handleDelete(item.id)} className="ledger-row-purge-btn">
                      Delete Stock
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