package edu.cit.sampan.InventoryManagement.controller;

import edu.cit.sampan.InventoryManagement.dto.DashboardMetricsDTO;
import edu.cit.sampan.InventoryManagement.entity.InventoryItem;
import edu.cit.sampan.InventoryManagement.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class InventoryController {

    @Autowired
    private InventoryItemRepository inventoryRepository;

    // --- Existing Methods (Keep your existing getAllItems, createItem, deleteItem) ---

    // 4. Low Stock Alerts
    @GetMapping("/dashboard-analytics/low-stock")
    public ResponseEntity<List<InventoryItem>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryRepository.findLowStockItems());
    }

    // 5. Analytics Summary Metrics
    @GetMapping("/dashboard-analytics/metrics")
    public ResponseEntity<DashboardMetricsDTO> getDashboardMetrics() {
        long totalItems = inventoryRepository.count();
        Double valuation = inventoryRepository.calculateTotalValuation();
        String topCat = inventoryRepository.findTopCategory();

        DashboardMetricsDTO dto = new DashboardMetricsDTO(
                totalItems,
                totalItems, // keeping your uniqueSkus logic
                valuation != null ? valuation : 0.0,
                topCat != null ? topCat : "N/A"
        );
        return ResponseEntity.ok(dto);
    }

    // --- NEW: Dashboard Summary for Cards (Admin vs Staff) ---
    @GetMapping("/dashboard/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummaryDefault() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalProducts", inventoryRepository.count());
        summary.put("lowStockCount", inventoryRepository.countByQuantityLessThanEqual(5));
        summary.put("totalValue", inventoryRepository.calculateTotalValuation() != null ?
                inventoryRepository.calculateTotalValuation() : 0.0);
        return ResponseEntity.ok(summary);
    }

    // --- NEW: Stock Transactions ---
    @PostMapping("/inventory/stock-in/{id}")
    public ResponseEntity<?> stockIn(@PathVariable Long id, @RequestParam Integer quantity) {
        InventoryItem item = inventoryRepository.findById(id).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();

        item.setQuantity(item.getQuantity() + quantity);
        inventoryRepository.save(item);
        return ResponseEntity.ok(item);
    }

    @PostMapping("/inventory/stock-out/{id}")
    public ResponseEntity<?> stockOut(@PathVariable Long id, @RequestParam Integer quantity) {
        InventoryItem item = inventoryRepository.findById(id).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();

        if (item.getQuantity() < quantity) {
            return ResponseEntity.badRequest().body("Insufficient stock.");
        }

        item.setQuantity(item.getQuantity() - quantity);
        inventoryRepository.save(item);
        return ResponseEntity.ok(item);
    }
    @GetMapping("/inventory")
    public ResponseEntity<List<InventoryItem>> getAllInventory() {
        // inventoryRepository.findAll() automatically writes the SQL: SELECT * FROM inventory_items;
        List<InventoryItem> items = inventoryRepository.findAll();
        return ResponseEntity.ok(items);
    }
}