import React, { useState, useEffect } from 'react';

export default function GenerateReports() {
  const [inventory, setInventory] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // NEW 1: State to track which category is currently selected
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch('https://stockpulse-cbdz.onrender.com/api/items')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch report data");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
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

  // NEW 2: Dynamically extract all unique categories from your inventory data
  const categories = ['All', ...new Set(inventory.map(item => item.category).filter(Boolean))];

  // NEW 3: Create a filtered list based on the dropdown selection
  const filteredInventory = selectedCategory === 'All' 
    ? inventory 
    : inventory.filter(item => item.category === selectedCategory);

  const handleDownloadCSV = () => {
    setIsDownloading(true);

    // UPDATED: Check the filtered list, not the master list
    if (filteredInventory.length === 0) {
      alert(`No data available to download for ${selectedCategory}!`);
      setIsDownloading(false);
      return;
    }

    const headers = ['System ID', 'SKU', 'Product Name', 'Category', 'Price (PHP)', 'Current Stock Level'];

    // UPDATED: Map the filtered list into CSV rows
    const csvRows = filteredInventory.map(item => {
      const safeName = item.name ? `"${item.name.replace(/"/g, '""')}"` : '""';
      return `${item.id},${item.sku || 'N/A'},${safeName},${item.category || 'N/A'},${item.price || 0},${item.quantity}`;
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // UPDATED: Dynamically names the file with the selected category and today's date
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Stock_Ledger_${selectedCategory.replace(/\s+/g, '_')}_${dateStr}.csv`;
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsDownloading(false), 500);
  };

  return (
    <div className="inventory-section mt-0">
    
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3>Master Stock Ledger</h3>
          <p className="report-description" style={{ margin: 0, color: '#64748b' }}>
            Export your warehouse inventory data for offline analysis, accounting, or record-keeping.
          </p>
        </div>
        
        {/* NEW 4: Added a flex container to group the dropdown and download button */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          
          {/* Dropdown Menu for Categories */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ 
              padding: '10px 14px', 
              borderRadius: '6px', 
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              fontSize: '15px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>

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
      </div>

      <hr className="section-divider" />

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
            {/* UPDATED: We now render the filteredInventory instead of the master inventory */}
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table-state">
                  {inventory.length === 0 ? "Loading ledger data..." : "No items found in this category."}
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => (
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