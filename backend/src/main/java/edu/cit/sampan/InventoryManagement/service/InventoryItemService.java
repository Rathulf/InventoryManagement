package edu.cit.sampan.InventoryManagement.service;

import edu.cit.sampan.InventoryManagement.entity.InventoryItem;
import edu.cit.sampan.InventoryManagement.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryItemService {

    @Autowired
    private InventoryItemRepository repository;

    @Autowired
    private AuditLogService auditLogService;

    public List<InventoryItem> getAllItems() {
        return repository.findAll();
    }

    public InventoryItem addItem(InventoryItem item) {
        InventoryItem savedItem = repository.save(item);
        
        // Automatically create an audit log
        auditLogService.logAction(
            "ADD_INVENTORY", 
            "System Admin", 
            "Added new stock item: " + savedItem.getName() + " (SKU: " + savedItem.getSku() + ")"
        );
        
        return savedItem;
    }

    public boolean deleteItem(Long id) {
        Optional<InventoryItem> itemOpt = repository.findById(id);
        if (itemOpt.isPresent()) {
            repository.deleteById(id);
            
            // Automatically create an audit log
            auditLogService.logAction(
                "DELETE_INVENTORY", 
                "System Admin", 
                "Deleted stock item: " + itemOpt.get().getName()
            );
            return true;
        }
        return false;
    }
}