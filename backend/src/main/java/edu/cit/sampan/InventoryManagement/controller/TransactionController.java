package edu.cit.sampan.InventoryManagement.controller;

import edu.cit.sampan.InventoryManagement.entity.InventoryTransaction;
import edu.cit.sampan.InventoryManagement.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<InventoryTransaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @PostMapping("/process")
    public ResponseEntity<String> processTransaction(@RequestBody Map<String, Object> payload) {
        Long itemId = Long.valueOf(payload.get("itemId").toString());
        String type = (String) payload.get("type");
        int quantity = (int) payload.get("quantity");
        String performedBy = (String) payload.get("performedBy");

        boolean success = transactionService.processTransaction(itemId, type, quantity, performedBy);
        return success ? ResponseEntity.ok("Success") : ResponseEntity.badRequest().body("Failed");
    }
}