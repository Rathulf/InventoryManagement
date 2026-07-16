package edu.cit.sampan.InventoryManagement.service;

import edu.cit.sampan.InventoryManagement.entity.InventoryItem;
import edu.cit.sampan.InventoryManagement.entity.InventoryTransaction;
import edu.cit.sampan.InventoryManagement.repository.InventoryItemRepository;
import edu.cit.sampan.InventoryManagement.repository.InventoryTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List; 
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private InventoryItemRepository itemRepository;

    @Autowired
    private InventoryTransactionRepository transactionRepository;

    @Autowired
    private AuditLogService auditLogService;
    
    // --- NEW METHOD ADDED HERE ---
    public List<InventoryTransaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public boolean processTransaction(Long itemId, String type, int quantity, String performedBy) {
        Optional<InventoryItem> itemOpt = itemRepository.findById(itemId);
        
        if (itemOpt.isPresent()) {
            InventoryItem item = itemOpt.get();
            
            // 1. Do the Math
            if (type.equalsIgnoreCase("IN")) {
                item.setQuantity(item.getQuantity() + quantity);
            } else if (type.equalsIgnoreCase("OUT")) {
                if (item.getQuantity() < quantity) {
                    return false; 
                }
                item.setQuantity(item.getQuantity() - quantity);
            }

            itemRepository.save(item);

            InventoryTransaction transaction = new InventoryTransaction();
            transaction.setItemId(itemId);
            transaction.setType(type.toUpperCase());
            transaction.setQuantity(quantity);
            transaction.setPerformedBy(performedBy);
            transactionRepository.save(transaction);

            auditLogService.logAction(
                "STOCK_" + type.toUpperCase(), 
                performedBy, 
                "Processed stock " + type.toLowerCase() + " of " + quantity + " for " + item.getName()
            );

            return true;
        }
        return false;
    }
}