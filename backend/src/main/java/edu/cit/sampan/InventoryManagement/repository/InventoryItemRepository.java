package edu.cit.sampan.InventoryManagement.repository;

import edu.cit.sampan.InventoryManagement.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    boolean existsBySku(String sku);

    // Existing methods
    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.minThreshold")
    List<InventoryItem> findLowStockItems();

    @Query("SELECT SUM(i.quantity * i.price) FROM InventoryItem i")
    Double calculateTotalValuation();

    @Query(value = "SELECT category FROM inventory_items GROUP BY category ORDER BY COUNT(*) DESC LIMIT 1", nativeQuery = true)
    String findTopCategory();

    long countByQuantityLessThanEqual(Integer threshold);

    @Query(value = "SELECT COUNT(*) FROM inventory_transactions WHERE type = 'IN' AND DATE(transaction_date) = CURRENT_DATE", nativeQuery = true)
    long countStockInToday();

    @Query(value = "SELECT COUNT(*) FROM inventory_transactions WHERE type = 'OUT' AND DATE(transaction_date) = CURRENT_DATE", nativeQuery = true)
    long countStockOutToday();
}