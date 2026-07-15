package edu.cit.sampan.InventoryManagement.repository;

import edu.cit.sampan.InventoryManagement.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional; // Add this import

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // Add this line so Spring Boot knows how to search by email
    Optional<Employee> findByEmail(String email); 
}