package edu.cit.sampan.InventoryManangement.controller;

import edu.cit.sampan.InventoryManangement.entity.User;
import edu.cit.sampan.InventoryManangement.entity.Role;
import edu.cit.sampan.InventoryManangement.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    // Dependency injection injects your database operations automatically
    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // 1. Check if email already exists in Supabase
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already registered!");
        }

        // 2. Default to STAFF role if no role selection was submitted
        if (user.getRole() == null) {
            user.setRole(Role.STAFF);
        }

        // 3. Save user to database
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        // 1. Look up user by email
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body("Error: Invalid email or password.");
        }

        User user = userOptional.get();

        // 2. Check plain text password comparison match
        if (!password.equals(user.getPassword())) {
            return ResponseEntity.status(401).body("Error: Invalid email or password.");
        }

        // 3. Package user session permissions response profile
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful!");
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name()); // ADMIN or STAFF

        return ResponseEntity.ok(response);
    }
}