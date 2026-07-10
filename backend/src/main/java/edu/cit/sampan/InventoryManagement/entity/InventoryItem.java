package edu.cit.sampan.InventoryManagement.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    @Column(name = "sku", nullable = false, unique = true)
    @JsonProperty("sku")
    private String sku;

    @Column(name = "name", nullable = false)
    @JsonProperty("name")
    private String name;

    // Explicit column mapping tells Hibernate to provision this column if it is missing
    @Column(name = "category", nullable = true)
    @JsonProperty("category")
    private String category = "General";

    @Column(name = "quantity")
    @JsonProperty("quantity")
    private Integer quantity = 0;

    @Column(name = "price")
    @JsonProperty("price")
    private Double price = 0.00;

    @Column(name = "min_threshold")
    @JsonProperty("minThreshold")
    private Integer minThreshold = 5;

    public InventoryItem() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getMinThreshold() { return minThreshold; }
    public void setMinThreshold(Integer minThreshold) { this.minThreshold = minThreshold; }
}