import React, { useState, useEffect, useMemo } from 'react';
import { useDashboardFilter } from '../../hooks/useDashboardFilter'; 

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

  // NEW: State to track which item is being edited and its temporary data
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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

  // --- NEW EDITING FUNCTIONS --- //
  
  // Triggers edit mode and copies the current item's data into the temporary edit form
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditFormData(item);
  };

  // Cancels edit mode without saving
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Handles typing inside the edit inputs
  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  // Sends the PUT request to Spring Boot to update the record
  const handleSaveEdit = (id) => {
    fetch(`https://stockpulse-cbdz.onrender.com/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFormData)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update item");
        setEditingId(null); // Close edit mode
        fetchInventory(); // Refresh the table
      })
      .catch(err => console.error("Error updating item:", err));
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
            <option value="Consumables">Consumables</option>
          </select>
          
          <input type="number" name="price" placeholder="Price (₱)" value={formData.price} onChange={handleInputChange} min="0" step="0.01" required />
          <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleInputChange} min="0" required />
          <input type="number" name="threshold" placeholder="Low Stock Threshold" value={formData.threshold} onChange={handleInputChange} min="0" required />
          
          <button type="submit" className="commit-record-btn">+ Add Record</button>
        </form>
      </div>

      <hr className="section-divider" />

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
                // NEW: Ternary operator to switch between EDIT MODE and VIEW MODE
                editingId === item.id ? (
                  
                  /* --- EDIT MODE ROW --- */
                  <tr key={item.id} style={{ backgroundColor: '#f8fafc' }}>
                    <td className="sku-cell">
                      {/* Usually SKU isn't editable, but you can change this to an input if needed */}
                      {item.sku} 
                    </td>
                    <td>
                      <input 
                        type="text" 
                        name="name" 
                        value={editFormData.name} 
                        onChange={handleEditChange} 
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '90%' }}
                      />
                    </td>
                    <td className="center-cell">
                      <input 
                        type="number" 
                        name="quantity" 
                        value={editFormData.quantity} 
                        onChange={handleEditChange} 
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '60px', textAlign: 'center' }}
                      />
                    </td>
                    <td className="center-cell">
                      <input 
                        type="number" 
                        name="threshold" 
                        value={editFormData.threshold} 
                        onChange={handleEditChange} 
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '60px', textAlign: 'center' }}
                      />
                    </td>
                    <td className="center-cell" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleSaveEdit(item.id)} 
                        style={{ backgroundColor: '#10b981', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelEdit} 
                        style={{ backgroundColor: '#94a3b8', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>

                ) : (
                  
                  /* --- VIEW MODE ROW --- */
                  <tr key={item.id}>
                    <td className="sku-cell">{item.sku}</td>
                    <td><strong>{item.name}</strong></td>
                    
                    <td className="center-cell">
                      <span className={item.quantity <= item.threshold ? "danger-stock" : "normal-stock"}>
                        {item.quantity}
                      </span>
                    </td>
                    
                    <td className="center-cell">{item.threshold}</td>
                    <td className="center-cell" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleEditClick(item)} 
                        style={{ backgroundColor: '#38bdf8', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="ledger-row-purge-btn"
                        style={{ margin: 0 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}