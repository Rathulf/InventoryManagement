package edu.cit.sampan.InventoryManagement.controller;

import edu.cit.sampan.InventoryManagement.dto.DashboardMetricsDTO;
import edu.cit.sampan.InventoryManagement.entity.InventoryItem;
import edu.cit.sampan.InventoryManagement.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // Targets your exact frontend layout engine port safely
public class InventoryController {

    @Autowired
    private InventoryItemRepository inventoryRepository;

    // 1. Get Master Inventory List
    @GetMapping("/inventory")
    public ResponseEntity<List<InventoryItem>> getAllItems() {
        return ResponseEntity.ok(inventoryRepository.findAll());
    }

    // 2. Add New Asset Record with explicit server-side error validation reporting
    @PostMapping("/inventory")
    public ResponseEntity<?> createItem(@RequestBody InventoryItem item) {
        if (item.getSku() == null || item.getSku().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Validation Error: SKU Code cannot be blank.");
        }
        if (inventoryRepository.existsBySku(item.getSku())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Database Error: An entry with SKU '" + item.getSku() + "' already exists inside the system registry.");
        }
        try {
            InventoryItem savedItem = inventoryRepository.save(item);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Database Save Error: " + e.getMessage());
        }
    }

    // 3. Purge/Delete Asset Record
    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        if (!inventoryRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Target database identifier does not exist.");
        }
        try {
            inventoryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Database Deletion Error: " + e.getMessage());
        }
    }

    // 4. Unique Path Low Stock Alert Endpoint
    @GetMapping("/dashboard-analytics/low-stock")
    public ResponseEntity<List<InventoryItem>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryRepository.findLowStockItems());
    }

    // 5. Analytics Summary Metrics Payload
    @GetMapping("/dashboard-analytics/metrics")
    public ResponseEntity<DashboardMetricsDTO> getDashboardMetrics() {
        long totalItems = inventoryRepository.count();
        long uniqueSkus = totalItems;

        Double valuation = inventoryRepository.calculateTotalValuation();
        String topCat = inventoryRepository.findTopCategory();

        DashboardMetricsDTO dto = new DashboardMetricsDTO(
                totalItems,
                uniqueSkus,
                valuation != null ? valuation : 0.0,
                topCat != null ? topCat : "N/A"
        );

        return ResponseEntity.ok(dto);
    }
}