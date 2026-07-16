package edu.cit.sampan.InventoryManagement;

import edu.cit.sampan.InventoryManagement.entity.Employee;
import edu.cit.sampan.InventoryManagement.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class InventoryManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(InventoryManagementApplication.class, args);
    }

    // Add this Bean to seed the database
    @Bean
    public CommandLineRunner initDatabase(EmployeeRepository employeeRepository) {
        return args -> {
            // Check if the database has any employees
            if (employeeRepository.count() == 0) {
                Employee defaultAdmin = new Employee();
                defaultAdmin.setName("System Admin");
                
                // Set this to the email you are trying to use in the screenshot!
                defaultAdmin.setEmail("Sampan@gmail.com"); 
                defaultAdmin.setPassword("admin123");
                defaultAdmin.setRole("Admin");
                defaultAdmin.setStatus("Active");
                defaultAdmin.setRequiresPasswordChange(false);
                
                employeeRepository.save(defaultAdmin);
                System.out.println("Default Admin user created successfully!");
            }
        };
    }
}