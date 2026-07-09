package edu.cit.sampan.InventoryManagement.repository;

import edu.cit.sampan.InventoryManagement.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, String> {
}