package edu.cit.sampan.InventoryManagement.controller;

import edu.cit.sampan.InventoryManagement.dto.EmployeeCreateDTO;
import edu.cit.sampan.InventoryManagement.dto.EmployeeResponseDTO;
import edu.cit.sampan.InventoryManagement.entity.Employee;
import edu.cit.sampan.InventoryManagement.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    // --- HELPER METHOD TO SECURE OUTGOING DATA ---
    // This converts your database Entity into a secure DTO before sending it to React
    private EmployeeResponseDTO convertToResponseDTO(Employee emp) {
        EmployeeResponseDTO dto = new EmployeeResponseDTO();
        dto.setId(emp.getId());
        dto.setName(emp.getName());
        dto.setEmail(emp.getEmail());
        dto.setRole(emp.getRole());
        dto.setStatus(emp.getStatus());
        return dto;
    }

    @GetMapping
    public ResponseEntity<List<EmployeeResponseDTO>> getAllEmployees() {
        // Fetch all employees, map them securely to DTOs, and package them in a List
        List<EmployeeResponseDTO> safeEmployees = employeeService.getAllEmployees()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(safeEmployees);
    }

    @PostMapping
    public ResponseEntity<EmployeeResponseDTO> addEmployee(@Valid @RequestBody EmployeeCreateDTO dto) {
        // 1. The @Valid tag ensures the incoming DTO passed all our safety checks
        // 2. Map the safe DTO data to a real database Entity
        Employee newEmployee = new Employee();
        newEmployee.setName(dto.getName());
        newEmployee.setEmail(dto.getEmail());
        newEmployee.setPassword(dto.getPassword());
        newEmployee.setRole(dto.getRole());

        // 3. Save the Entity to the database
        Employee savedEmp = employeeService.addEmployee(newEmployee);
        
        // 4. Return the newly created account as a secure DTO
        return ResponseEntity.ok(convertToResponseDTO(savedEmp));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateEmployeeStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<Employee> updatedEmp = employeeService.updateStatus(id, request);
        if (updatedEmp.isPresent()) {
            return ResponseEntity.ok(convertToResponseDTO(updatedEmp.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        if (employeeService.deleteEmployee(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<Employee> employee = employeeService.authenticateLogin(email, password);
        
        if (employee.isPresent()) {
            // Converts the logged-in user to a DTO so their hashed password doesn't go to local storage
            return ResponseEntity.ok(convertToResponseDTO(employee.get()));
        } else {
            return ResponseEntity.status(401).body("Invalid credentials or inactive account");
        }
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> requestBody) {
        String newPassword = requestBody.get("newPassword");
        
        Optional<Employee> updatedEmp = employeeService.updatePassword(id, newPassword);

        if (updatedEmp.isPresent()) {
            return ResponseEntity.ok(convertToResponseDTO(updatedEmp.get()));
        }
        return ResponseEntity.notFound().build();
    }
}