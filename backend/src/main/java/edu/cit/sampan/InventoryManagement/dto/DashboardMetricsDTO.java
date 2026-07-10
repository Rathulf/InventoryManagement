package edu.cit.sampan.InventoryManagement.dto;

public class DashboardMetricsDTO {
    private long totalItems;
    private long uniqueSkus;
    private double totalValuation;
    private String topCategory;

    public DashboardMetricsDTO(long totalItems, long uniqueSkus, double totalValuation, String topCategory) {
        this.totalItems = totalItems;
        this.uniqueSkus = uniqueSkus;
        this.totalValuation = totalValuation;
        this.topCategory = topCategory;
    }

    // Getters
    public long getTotalItems() { return totalItems; }
    public long getUniqueSkus() { return uniqueSkus; }
    public double getTotalValuation() { return totalValuation; }
    public String getTopCategory() { return topCategory; }
}