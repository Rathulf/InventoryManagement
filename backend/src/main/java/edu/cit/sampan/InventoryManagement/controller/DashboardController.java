package edu.cit.sampan.InventoryManagement.controller;

import edu.cit.sampan.InventoryManagement.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        Map<String, Object> summaryData = dashboardService.getSystemSummary();
        return ResponseEntity.ok(summaryData);
    }
}