import React, { useState, useEffect } from 'react';
import StockTransaction from '../components/StockTransaction'; 

export default function StaffDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = () => {
    setIsLoading(true);
    fetch('http://localhost:8080/api/transactions')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch transactions");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // Sort by newest first 
          const sortedData = data.sort((a, b) => b.id - a.id);
          setTransactions(sortedData);
        } else {
          setTransactions([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchTransactions();
  };

  return (
    <div className="inventory-section mt-0">
      
      {/* HEADER & OPERATIONS */}
      <div className="operations-header">
        <h3>Staff Operations</h3>
        <p className="operations-desc">
          Record incoming deliveries or outgoing warehouse stock.
        </p>
        
        {/* FLEXBOX CONTAINER FOR BUTTONS */}
        <div className="action-buttons-container">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-action btn-stock-in"
          >
            📥 Stock In
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-action btn-stock-out"
          >
            📤 Stock Out
          </button>
        </div>
      </div>

      <hr className="section-divider" />

      {/* TRANSACTIONS TABLE */}
      <div className="transactions-card">
        <h3>Recent Transactions</h3>
        
        {isLoading ? (
          <p className="table-state-msg msg-loading"><i>Loading transactions...</i></p>
        ) : transactions.length === 0 ? (
          <p className="table-state-msg msg-empty"><i>No recent transactions recorded today.</i></p>
        ) : (
          <div className="table-responsive-container">
            <table className="ledger-table-view">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Item ID</th>
                  <th className="center-cell">Quantity Adjusted</th>
                  <th>Performed By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>TXN-{tx.id}</td>
                    <td className={tx.type === 'IN' ? 'tx-type-in' : 'tx-type-out'}>
                      {tx.type}
                    </td>
                    <td>Product #{tx.itemId}</td>
                    <td className="center-cell tx-quantity">
                      {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                    </td>
                    <td>{tx.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ACTION OVERLAY MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              onClick={handleCloseModal}
              className="modal-close-btn"
              title="Close Modal"
            >
              &times;
            </button>
            
            <StockTransaction />
            
          </div>
        </div>
      )}

    </div>
  );
}