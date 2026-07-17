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
          <button onClick={() => { setViewType('IN'); setIsModalOpen(true); }} className="btn-action btn-stock-in">📥 Stock In</button>
          <button onClick={() => { setViewType('OUT'); setIsModalOpen(true); }} className="btn-action btn-stock-out">📤 Stock Out</button>
        </div>
      </div>

      <hr className="section-divider" />

      <div className="transactions-card">
        <h3>Recent Transactions</h3>
        
        {isLoading ? (
          <p className="table-state-msg msg-loading">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="table-state-msg msg-empty">No transactions recorded.</p>
        ) : (
          /* SCROLLABLE WRAPPER */
          <div className="table-responsive-container">
            <table className="ledger-table-view">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Item ID</th>
                  <th className="center-cell">Quantity</th>
                  <th>Performed By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>TXN-{tx.id}</td>
                    <td className={tx.type === 'IN' ? 'tx-type-in' : 'tx-type-out'}>{tx.type}</td>
                    <td>Product #{tx.itemId}</td>
                    <td className="center-cell tx-quantity">{tx.type === 'IN' ? '+' : '-'}{tx.quantity}</td>
                    <td>{tx.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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