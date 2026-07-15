package edu.cit.sampan.InventoryManagement.controller;

import edu.cit.sampan.InventoryManagement.entity.Employee;
import edu.cit.sampan.InventoryManagement.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:5173") 
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    // GET: Fetch all employees for the table
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }

    // POST: Add a new employee from the form
    @PostMapping
    public ResponseEntity<Employee> addEmployee(@RequestBody Employee employee) {
        Employee savedEmployee = employeeRepository.save(employee);
        return ResponseEntity.ok(savedEmployee);
    }

    // POST: Handle user login
   @PostMapping("/login")
    public ResponseEntity<?> loginEmployee(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password"); // Get the password from React
        
        Optional<Employee> employee = employeeRepository.findByEmail(email);

        if (employee.isPresent()) {
            // Check if the password matches!
            if (employee.get().getPassword().equals(password)) {
                if (employee.get().getStatus().equals("Active")) {
                    return ResponseEntity.ok(employee.get());
                } else {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account is inactive.");
                }
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password.");
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found.");
    }

    // DELETE: Remove an employee
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        if (employeeRepository.existsById(id)) {
            employeeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}