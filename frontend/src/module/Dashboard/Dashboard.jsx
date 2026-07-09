import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const cachedProfileString = localStorage.getItem("activeUser");
    if (!cachedProfileString) {
      navigate("/login");
      return;
    }
    
    const parsedUserObj = JSON.parse(cachedProfileString);
    setUser(parsedUserObj);

    // Read flash storage to trace if safe login alert banner transitions are required
    const accessTriggerFlag = sessionStorage.getItem("loginSuccessNotification");
    if (accessTriggerFlag) {
      setSuccessMsg(`Welcome back, ${parsedUserObj.name}! Secure system session authorized.`);
      sessionStorage.removeItem("loginSuccessNotification");
      
      // Auto-expire success message visibility after 5 second timeline durations
      const timer = setTimeout(() => {
        setSuccessMsg("");
      }, 5000);
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
      console.error(err);
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
          <button onClick={processSignOut} className="logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {successMsg && <div className="alert-box success-alert">{successMsg}</div>}
      {error && <div className="alert-box error-alert">{error}</div>}

      <section className="metrics-grid">
        <div className="metric-card">
          <h3>Total Unique SKUs</h3>
          <p className="metric-num">{items.length}</p>
        </div>
        <div className="metric-card">
          <h3>Total Stock Volume</h3>
          <p className="metric-num">
            {items.reduce((acc, current) => acc + (current.quantity || 0), 0)}{" "}
            <span className="unit-label">units</span>
          </p>
        </div>
        <div className="metric-card">
          <h3>Critical Alerts</h3>
          <p className="metric-num critical">
            {items.filter((item) => (item.quantity || 0) < 5).length}{" "}
            <span className="sub-label">Items Low</span>
          </p>
        </div>
      </section>

      <main className="workspace-layout">
        <div className="table-container">
          <div className="table-header-row">
            <h3>Master Stock Registry</h3>
            
            {/* 🟢 ROLE-BASED UI BOUNDARY: Restricted explicitly to ADMIN authorizations */}
            {user.role === "ADMIN" && (
              <button 
                className="action-btn-primary" 
                onClick={() => alert("Administrative Action Context Window: Add product schema triggered.")}
              >
                + Add New Item (Admin Only)
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
                    No items found in your inventory database. 
                    {user.role === "ADMIN" 
                      ? " Click '+ Add New Item' to populate rows." 
                      : " Awaiting admin stock allocation."}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.sku}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <span className={`status-badge ${item.quantity < 5 ? "low" : "ok"}`}>
                        {item.quantity < 5 ? "Low Stock" : "Healthy"}
                      </span>
                    </td>
                    
                    {/* 🟢 ROLE-BASED ACTIONS COLUMN: Restricted to ADMIN profiles */}
                    {user.role === "ADMIN" && (
                      <td>
                        <button className="edit-mini-btn" onClick={() => alert(`Edit SKU: ${item.sku}`)}>Edit</button>
                        <button className="delete-mini-btn" onClick={() => alert(`Delete SKU: ${item.sku}`)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}