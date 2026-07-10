package edu.cit.sampan.InventoryManagement.repository;

import edu.cit.sampan.InventoryManagement.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    boolean existsBySku(String sku);

    // Low stock alert query
    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.minThreshold")
    List<InventoryItem> findLowStockItems();

    // Valuation calculation with safety fallbacks
    @Query("SELECT SUM(i.quantity * i.price) FROM InventoryItem i")
    Double calculateTotalValuation();

    // Extracted top operational category
    @Query("SELECT i.category FROM InventoryItem i GROUP BY i.category ORDER BY COUNT(i) DESC LIMIT 1")
    String findTopCategory();
}