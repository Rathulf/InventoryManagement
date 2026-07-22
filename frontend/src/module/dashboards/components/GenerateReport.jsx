import React, { useState, useEffect } from 'react';

export default function GenerateReports() {
  const [inventory, setInventory] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // 1. Fetch the master inventory list when the page loads and sort by ID ascending (oldest to newest)
  useEffect(() => {
    fetch('https://stockpulse-cbdz.onrender.com/api/items')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch report data");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // Force sort: handles both numerical and string IDs safely from oldest to newest
          const sortedData = data.sort((a, b) => {
            const idA = Number(a.id) || 0;
            const idB = Number(b.id) || 0;
            return idA - idB;
          });
          setInventory(sortedData);
        }
      })
      .catch(err => console.error("Error fetching report data:", err));
  }, []);

  // 2. CSV Generation Logic
  const handleDownloadCSV = () => {
    setIsDownloading(true);

    if (inventory.length === 0) {
      alert("No data available to download!");
      setIsDownloading(false);
      return;
    }

    // Define exactly what columns go into the Excel/CSV file
    const headers = ['System ID', 'SKU', 'Product Name', 'Category', 'Price (PHP)', 'Current Stock Level'];

    // Map the React state into CSV rows
    const csvRows = inventory.map(item => {
      // Wraps the product name in quotes just in case it contains commas
      const safeName = item.name ? `"${item.name.replace(/"/g, '""')}"` : '""';
      
      return `${item.id},${item.sku || 'N/A'},${safeName},${item.category || 'N/A'},${item.price || 0},${item.quantity}`;
    });

    // Stitch it all together
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Trigger the browser download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    // Dynamically names the file with today's date
    link.setAttribute('download', `Master_Stock_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset button state
    setTimeout(() => setIsDownloading(false), 500);
  };

  return (
    <div className="inventory-section mt-0">
    
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3>Master Stock Ledger</h3>
          <p className="report-description" style={{ margin: 0, color: '#64748b' }}>
            Export your complete warehouse inventory data for offline analysis, accounting, or record-keeping.
          </p>
        </div>
        
        <button 
          onClick={handleDownloadCSV} 
          disabled={isDownloading}
          className="commit-record-btn btn-icon-flex"
          style={{ margin: 0, backgroundColor: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '18px' }}>📥</span>
          {isDownloading ? 'Generating File...' : 'Download CSV Report'}
        </button>
      </div>

      <hr className="section-divider" />

      {/* WRAPPED IN RESPONSIVE CONTAINER FOR SCROLLING */}
      <div className="table-responsive-container">
        <table className="ledger-table-view">
          <thead>
            <tr>
              <th>ID</th>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th className="center-cell">Price</th>
              <th className="center-cell">Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table-state">Loading ledger data...</td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id}>
                  <td style={{ color: '#94a3b8' }}>#{item.id}</td>
                  <td>{item.sku}</td>
                  <td><strong>{item.name}</strong></td>
                  <td>
                    <span className="badge-cat" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>
                      {item.category}
                    </span>
                  </td>
                  <td className="center-cell">₱{parseFloat(item.price || 0).toFixed(2)}</td>
                  <td className="center-cell">
                    <span className={item.quantity <= (item.threshold || 200) ? "danger-stock" : "normal-stock"}>
                      {item.quantity}
                    </span>
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