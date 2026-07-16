package edu.cit.sampan.InventoryManagement.service;

import edu.cit.sampan.InventoryManagement.entity.InventoryItem;
import edu.cit.sampan.InventoryManagement.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private InventoryItemRepository inventoryRepository;

    public Map<String, Object> getSystemSummary() {
        Map<String, Object> summary = new HashMap<>();

        // 1. Calculate Total Products
        long totalProducts = inventoryRepository.count();

        // 2. Fetch Low Stock Items (using your custom repository query)
        List<InventoryItem> lowStockProducts = inventoryRepository.findLowStockItems();
        int lowStockCount = lowStockProducts.size();

        // 3. Calculate Total Financial Value
        Double totalValue = inventoryRepository.calculateTotalValuation();
        if (totalValue == null) {
            totalValue = 0.0; // Failsafe if the database is empty
        }

        // 4. Package it all into a single map that React can easily read
        summary.put("totalProducts", totalProducts);
        summary.put("lowStock", lowStockCount);
        summary.put("totalValue", totalValue);
        summary.put("lowStockProducts", lowStockProducts);

        return summary;
    }
}