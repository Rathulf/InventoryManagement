import React, { useState, useEffect } from 'react';
import StockTransaction from '../components/StockTransaction'; 

export default function StaffDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewType, setViewType] = useState('IN');

  const fetchTransactions = () => {
    setIsLoading(true);
    fetch('http://localhost:8080/api/transactions') 
      .then(res => res.json())
      .then(data => {
        setTransactions(Array.isArray(data) ? data.sort((a, b) => b.id - a.id) : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTransactions([]);
        setIsLoading(false);
      });
  };

  useEffect(() => { fetchTransactions(); }, []);

  return (
    <div className="inventory-section mt-0">
      <div className="operations-header">
        <h3>Staff Operations</h3>
        <p className="operations-desc">Record incoming deliveries or outgoing warehouse stock.</p>
        
        <div className="action-buttons-container">
          <button onClick={() => { setViewType('IN'); setIsModalOpen(true); }} className="btn-action btn-stock-in">
            📥 Stock In
          </button>
          <button onClick={() => { setViewType('OUT'); setIsModalOpen(true); }} className="btn-action btn-stock-out">
            📤 Stock Out
          </button>
        </div>
      </div>

      <hr className="section-divider" />

      {/* Transaction Table remains as previously implemented */}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">&times;</button>
            <StockTransaction initialType={viewType} isLocked={true} />
          </div>
        </div>
      )}
    </div>
  );
}