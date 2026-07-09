import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // 🟢 Modal Overlay Interface Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    const cachedProfileString = localStorage.getItem("activeUser");
    if (!cachedProfileString) {
      navigate("/login");
      return;
    }
    const parsedUserObj = JSON.parse(cachedProfileString);
    setUser(parsedUserObj);

    const accessTriggerFlag = sessionStorage.getItem("loginSuccessNotification");
    if (accessTriggerFlag) {
      setSuccessMsg(`Welcome back, ${parsedUserObj.name}! Secure system session authorized.`);
      sessionStorage.removeItem("loginSuccessNotification");
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }

    fetchStockItems();
  }, [navigate]);

  const fetchStockItems = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/inventory");
      if (response.ok) {
        const dataArray = await response.json();
        setItems(dataArray);
      } else {
        setError("Failed to fetch master stock registry data elements.");
      }
    } catch (err) {
      setError("API Connection Offline. Fallback state deployed.");
    }
  };

  // 🟢 FEATURE: Send Form Data directly to your single InventoryController
  const handleAddItem = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const newItemPayload = {
      sku: sku,
      name: itemName,
      category: category,
      quantity: parseInt(quantity, 10) || 0
    };

    try {
      const response = await fetch("http://localhost:8080/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemPayload)
      });

      if (response.ok) {
        setSuccessMsg(`Successfully added stock item: ${itemName}`);
        setIsModalOpen(false); // Close Modal
        setSku(""); setItemName(""); setCategory(""); setQuantity(""); // Reset inputs
        fetchStockItems(); // Refresh master table rows live
      } else {
        setError("Failed to store the new stock entry row.");
      }
    } catch (err) {
      setError("Network error. Unable to reach backend asset endpoint.");
    }
  };

  // 🔴 FEATURE: Purge asset row from database using unique ID string values
  const handlePurgeItem = async (itemId, name) => {
    if (!window.confirm(`Are you sure you want to permanently purge ${name}?`)) return;
    setError(""); setSuccessMsg("");

    try {
      const response = await fetch(`http://localhost:8080/api/inventory/${itemId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setSuccessMsg(`Successfully purged item: ${name}`);
        fetchStockItems();
      } else {
        setError("Failed to delete the asset row from the backend registry.");
      }
    } catch (err) {
      setError("Network error connecting to database purge endpoints.");
    }
  };

  const processSignOut = () => {
    localStorage.removeItem("activeUser");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-brand">
          <h2>StockPulse Hub Workspace</h2>
          <span className="role-tag">{user.role} INTERFACE</span>
        </div>
        <div className="user-profile-zone">
          <p>Operator: <strong>{user.name}</strong> ({user.email})</p>
          <button onClick={processSignOut} className="logout-btn">Sign Out</button>
        </div>
      </header>

      {successMsg && <div className="alert-box success-alert" style={{ margin: "20px auto 0 auto" }}>{successMsg}</div>}
      {error && <div className="alert-box error-alert" style={{ margin: "20px auto 0 auto" }}>{error}</div>}

      <section className="metrics-grid">
        <div className="metric-card"><h3>Total Unique SKUs</h3><p className="metric-num">{items.length}</p></div>
        <div className="metric-card">
          <h3>Total Stock Volume</h3>
          <p className="metric-num">{items.reduce((acc, curr) => acc + (curr.quantity || 0), 0)} <span className="unit-label">units</span></p>
        </div>
        <div className="metric-card">
          <h3>Critical Alerts</h3>
          <p className="metric-num critical">{items.filter(item => (item.quantity || 0) < 5).length} <span className="sub-label">Items Low</span></p>
        </div>
      </section>

      <main className="workspace-layout">
        <div className="table-container">
          <div className="table-header-row">
            <h3>Master Stock Registry</h3>
            
            {/* 🟢 ROLE-BASED VIEW SEPARATION: Button only displays if Admin logged in */}
            {user.role === "ADMIN" && (
              <button className="action-btn-primary" onClick={() => setIsModalOpen(true)}>
                + Add New Item
              </button>
            )}
          </div>

          <table className="inventory-table">
            <thead>
              <tr>
                <th>SKU ID</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Status</th>
                {user.role === "ADMIN" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={user.role === "ADMIN" ? 6 : 5} className="empty-table-cell">
                    No items found in your inventory database. {user.role === "ADMIN" && "Click '+ Add New Item' to populate rows."}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.sku}</strong></td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <span className={`status-badge ${item.quantity < 5 ? "low" : "ok"}`}>
                        {item.quantity < 5 ? "Low Stock" : "Healthy"}
                      </span>
                    </td>
                    {/* 🟢 ROLE-BASED ACTIONS: Management buttons hidden completely from STAFF view */}
                    {user.role === "ADMIN" && (
                      <td>
                        <button className="delete-mini-btn" onClick={() => handlePurgeItem(item.id, item.name)}>Purge</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* 🟢 THE INTERACTIVE INPUT DIALOG FORM WINDOW */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Register New Inventory Asset</h3>
            <form onSubmit={handleAddItem}>
              <div className="input-group">
                <label>SKU Serial Reference Code</label>
                <input type="text" placeholder="e.g., SKU-1002" value={sku} onChange={(e) => setSku(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Item Name</label>
                <input type="text" placeholder="e.g., Enterprise Router" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Category Group</label>
                <input type="text" placeholder="e.g., Networking" value={category} onChange={(e) => setCategory(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Starting Quantity Units</label>
                <input type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="logout-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="action-btn-primary">Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}