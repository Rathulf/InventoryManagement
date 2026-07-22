import { useState, useMemo } from 'react';

export const useDashboardFilter = (initialData = [], initialThreshold = 0) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockThreshold, setStockThreshold] = useState(initialThreshold); 

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

      return matchesSearch && matchesThreshold;
    });
  }, [initialData, searchQuery, stockThreshold]);

  return {
    searchQuery,
    setSearchQuery,
    stockThreshold,
    setStockThreshold,
    filteredData,
  };
};