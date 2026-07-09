package edu.cit.sampan.InventoryManagement.controller;

import edu.cit.sampan.InventoryManagement.entity.InventoryItem;
import edu.cit.sampan.InventoryManagement.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    // 🟢 FETCH: Returns all items for both dashboards
    @GetMapping
    public ResponseEntity<List<InventoryItem>> getAllItems() {
        return ResponseEntity.ok(inventoryItemRepository.findAll());
    }

    // 🟢 CREATE: Receives the React modal payload and saves a new item
    @PostMapping
    public ResponseEntity<?> createItem(@RequestBody InventoryItem item) {
        if (item.getSku() == null || item.getSku().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "SKU code is required."));
        }
        InventoryItem saved = inventoryItemRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 🔴 PURGE: Deletes an asset row dynamically using its unique ID string
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable String id) {
        if (!inventoryItemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        inventoryItemRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Asset row successfully removed."));
    }
}