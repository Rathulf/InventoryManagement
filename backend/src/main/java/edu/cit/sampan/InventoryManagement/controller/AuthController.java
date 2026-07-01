package edu.cit.sampan.InventoryManagement.controller;

import edu.cit.sampan.InventoryManagement.entity.*;
import edu.cit.sampan.InventoryManagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
// Bypasses the browser CORS block specifically for your Vite dev server port
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/auth/register
     * Handles account registration for new administrative/staff members.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            // 1. Validate incoming data payloads
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email address is required.");
            }
            if (user.getPassword() == null || user.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body("Password must be at least 6 characters long.");
            }

            // 2. Check if the email address is already in use
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email address is already registered.");
            }

            // 3. Save user profile to Supabase database
            // Note: If you add BCrypt hashing later, encrypt user.getPassword() here before saving!
            User savedUser = userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully!");
            response.put("userId", savedUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Database transmission failure: " + e.getMessage());
        }
    }

    /**
     * POST /api/auth/login
     * Validates credentials and returns session details to React.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            // 1. Quick empty fields check
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body("Please fill out all fields.");
            }

            // 2. Lookup user record by email inside Supabase
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
            }

            User user = userOptional.get();

            // 3. Perform string match comparison
            // Warning: If your registration hashes passwords, change this line to use passwordEncoder.matches()!
            if (!user.getPassword().equals(password)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
            }

            // 4. Send back active session role information to store in localStorage
            Map<String, Object> sessionData = new HashMap<>();
            sessionData.put("name", user.getName());
            sessionData.put("email", user.getEmail());
            sessionData.put("role", user.getRole()); // E.g., "Admin / Owner" or "Staff Member"

            return ResponseEntity.ok(sessionData);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Authentication mapping failure: " + e.getMessage());
        }
    }
}