import React, { useState, useEffect } from 'react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('https://stockpulse-cbdz.onrender.com/api/audit-logs')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch logs");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(err => console.error("Error fetching audit logs:", err));
  }, []);

  // Formats the ugly database timestamp into a readable date and time
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // e.g., "7/16/2026, 11:30:00 PM"
  };

  return (
    <div className="inventory-section mt-0">
      <div style={{ marginBottom: '24px' }}>
        <h3>System Audit Trail</h3>
        <p className="report-description" style={{ color: '#64748b' }}>
          Monitor system activity, administrative changes, and user actions.
        </p>
      </div>

      {/* WRAPPED IN RESPONSIVE CONTAINER */}
      <div className="table-responsive-container">
        <table className="ledger-table-view">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Action</th>
              <th>Performed By</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-table-state">No system events logged yet.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ color: '#64748b', fontSize: '14px' }}>
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td>
                    <span className="badge-cat" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold' }}>
                      {log.action}
                    </span>
                  </td>
                  <td><strong>{log.performedBy}</strong></td>
                  <td>{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}