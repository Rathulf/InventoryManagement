import React, { useState } from 'react';

export default function GenerateReports() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadCSV = () => {
    // ... Keep your existing download logic here ...
  };

  return (
    <div className="inventory-section mt-0">
      <h3>Generate System Reports</h3>
      <p className="report-description">
        Export your current warehouse inventory data for offline analysis, accounting, or record-keeping.
      </p>
      
      <div className="metrics-layout-grid report-grid">
        <div className="metric-display-card report-card-content">
          <h4 className="report-card-title">Master Stock Ledger</h4>
          <p className="report-card-desc">
            A complete CSV export of all database records. Includes unique IDs, SKUs, product names, categories, pricing, and current stock levels.
          </p>
          
          <button 
            onClick={handleDownloadCSV} 
            disabled={isDownloading}
            className="commit-record-btn btn-icon-flex"
          >
            {isDownloading ? '⏳ Generating File...' : '📥 Download CSV File'}
          </button>
        </div>
      </div>
    </div>
  );
}