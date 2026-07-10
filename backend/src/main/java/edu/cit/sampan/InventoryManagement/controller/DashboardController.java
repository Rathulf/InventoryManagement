package edu.cit.sampan.InventoryManagement.controller;

import edu.cit.sampan.InventoryManagement.dto.DashboardMetricsDTO;
import edu.cit.sampan.InventoryManagement.entity.InventoryItem;
import edu.cit.sampan.InventoryManagement.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*") // Allows smooth connection configurations
public class DashboardController {

    @Autowired
    private InventoryItemRepository inventoryRepository;

    // Feature 1: Low Stock Alert Endpoint
    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryItem>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryRepository.findLowStockItems());
    }

    // Feature 3: Integrated Analytics Summary Metric Payload
    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsDTO> getDashboardSummaryMetrics() {
        long totalItems = inventoryRepository.count();
        long uniqueSkus = totalItems; // Tracks database single layout entries
        Double valuation = inventoryRepository.calculateTotalValuation();
        String topCat = inventoryRepository.findTopCategory();

        return ResponseEntity.ok(new DashboardMetricsDTO(
                totalItems,
                uniqueSkus,
                valuation != null ? valuation : 0.0,
                topCat != null ? topCat : "N/A"
        ));
    }
}