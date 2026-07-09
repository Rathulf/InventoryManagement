package edu.cit.sampan.InventoryManagement.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(name = "sku", nullable = false, unique = true)
    private String sku;
    private Integer qty;

    public InventoryItem() {}

    public InventoryItem(String name, String sku, Integer qty) {
        this.name = name;
        this.sku = sku;
        this.qty = qty;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }
}