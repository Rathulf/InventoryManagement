import { useState, useMemo } from 'react';

export const useDashboardFilter = (initialData = [], initialThreshold = 0) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockThreshold, setStockThreshold] = useState(initialThreshold); 
  const [selectedCategory, setSelectedCategory] = useState(''); // NEW: Category state

  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      
      const matchesSearch =
        query === '' ||
        item.name?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query);

      const matchesThreshold =
        stockThreshold === 0 || item.quantity <= stockThreshold;

      // NEW: Check if the item matches the dropdown selection
      const matchesCategory = 
        selectedCategory === '' || 
        (item.category || 'Uncategorized') === selectedCategory;

      return matchesSearch && matchesThreshold && matchesCategory;
    });
  }, [initialData, searchQuery, stockThreshold, selectedCategory]);

  return {
    searchQuery,
    setSearchQuery,
    stockThreshold,
    setStockThreshold,
    selectedCategory,     // Export the new state
    setSelectedCategory,  // Export the new setter
    filteredData,
  };
};