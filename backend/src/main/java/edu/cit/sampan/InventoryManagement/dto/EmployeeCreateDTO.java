package edu.cit.sampan.InventoryManagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EmployeeCreateDTO {

    @NotBlank(message = "Full Name is required")
    private String name;

    @NotBlank(message = "Email Address is required")
    @Email(message = "Must be a valid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Role is required")
    private String role;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) {this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}