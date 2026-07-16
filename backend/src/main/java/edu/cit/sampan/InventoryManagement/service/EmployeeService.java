package edu.cit.sampan.InventoryManagement.service;

import edu.cit.sampan.InventoryManagement.entity.Employee;
import edu.cit.sampan.InventoryManagement.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository repository;

    @Autowired
    private AuditLogService auditLogService;

    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }

    public Employee addEmployee(Employee emp) {
        // Enforce active status
        emp.setStatus("Active");
        Employee savedEmp = repository.save(emp);
        
        auditLogService.logAction(
            "REGISTER_STAFF", 
            "System Admin", 
            "Registered a new " + emp.getRole() + " account for " + emp.getName()
        );
        
        return savedEmp;
    }

    public Optional<Employee> updateStatus(Long id, Map<String, String> request) {
        Optional<Employee> empOpt = repository.findById(id);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            String newStatus = request.get("status");
            emp.setStatus(newStatus);
            repository.save(emp);
            
            // This hooks into the audit log we built earlier!
            auditLogService.logAction(
                "UPDATE_STATUS", 
                "System Admin", 
                "Changed access status for " + emp.getName() + " to " + newStatus
            );
            
            return Optional.of(emp);
        }
        return Optional.empty();
    }
    
    public Optional<Employee> authenticateLogin(String email, String password) {
        Optional<Employee> empOpt = repository.findByEmail(email);
        
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            // Check if passwords match AND the account status is exactly "Active"
            if (emp.getPassword().equals(password) && "Active".equalsIgnoreCase(emp.getStatus())) {
                
                // Automatically records the login in your system audit trail
                auditLogService.logAction(
                    "STAFF_LOGIN", 
                    emp.getName(), 
                    "User logged into the system"
                );
                
                return Optional.of(emp);
            }
        }
        return Optional.empty(); // Login failed
    }

    public Optional<Employee> updatePassword(Long id, String newPassword) {
        // Fixed: Uses the 'repository' variable you defined at the top of the file
        Optional<Employee> employeeOpt = repository.findById(id);
        
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            
            // Set the new password
            employee.setPassword(newPassword);
            
            // Flip the flag so they aren't forced to reset it again
            employee.setRequiresPasswordChange(false);
            
            // Save and return the updated employee
            return Optional.of(repository.save(employee));
        }
        
        return Optional.empty();
    }

    public boolean deleteEmployee(Long id) {
        Optional<Employee> empOpt = repository.findById(id);
        if (empOpt.isPresent()) {
            repository.deleteById(id);
            
            auditLogService.logAction(
                "PURGE_STAFF", 
                "System Admin", 
                "Permanently deleted account for " + empOpt.get().getName()
            );
            
            return true;
        }
        return false;
    }
}