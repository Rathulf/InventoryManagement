package edu.cit.sampan.InventoryManagement.controller;

import edu.cit.sampan.InventoryManagement.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/process")
    public ResponseEntity<String> processStock(@RequestBody Map<String, Object> payload) {
        Long itemId = Long.valueOf(payload.get("itemId").toString());
        String type = payload.get("type").toString(); // "IN" or "OUT"
        int quantity = Integer.parseInt(payload.get("quantity").toString());
        String performedBy = payload.get("performedBy").toString();

        boolean success = transactionService.processTransaction(itemId, type, quantity, performedBy);
        
        if (success) {
            return ResponseEntity.ok("Transaction processed successfully.");
        } else {
            return ResponseEntity.badRequest().body("Transaction failed. Check item ID or ensure sufficient stock for OUT.");
        }
    }
}