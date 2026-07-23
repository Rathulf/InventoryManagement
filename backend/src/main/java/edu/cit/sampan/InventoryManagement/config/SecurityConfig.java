package edu.cit.sampan.InventoryManagement.config;

// NEW IMPORTS REQUIRED FOR MIGRATION
import edu.cit.sampan.InventoryManagement.entity.Employee;
import edu.cit.sampan.InventoryManagement.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF token tracking since we are debugging locally
                .csrf(csrf -> csrf.disable())

                // Activate our explicit global CORS settings block
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Configure route endpoint permissions
                .authorizeHttpRequests(auth -> auth
                        // Permissive rule 1: Allow your authentication login path endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        
                        // Permissive rule 2: Allow all metric analytics endpoints
                        .requestMatchers("/api/dashboard-analytics/**").permitAll()
                        
                        // Permissive rule 3: UNBLOCK POST, DELETE, and GET actions for inventory management
                        .requestMatchers("/api/inventory/**").permitAll()
                        
                        // Fallback catch-all condition rule
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ALLOW BOTH LOCALHOST AND YOUR LIVE RENDER FRONTEND
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://inventorymanagement-2qbg.onrender.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // NEW: AUTOMATIC PASSWORD MIGRATION SCRIPT
    @Bean
    public CommandLineRunner migratePasswords(EmployeeRepository repository, PasswordEncoder passwordEncoder) {
        return args -> {
            List<Employee> employees = repository.findAll();
            int updatedCount = 0;

            for (Employee emp : employees) {
                String currentPassword = emp.getPassword();
                
                if (currentPassword != null && !currentPassword.startsWith("$2a$")) {
                    String hashedPassword = passwordEncoder.encode(currentPassword);
                    emp.setPassword(hashedPassword);
                    repository.save(emp);
                    updatedCount++;
                    System.out.println("Migrated plain-text password for user: " + emp.getEmail());
                }
            }
            
            if (updatedCount > 0) {
                System.out.println("Successfully hashed " + updatedCount + " legacy passwords.");
            }
        };
    }
}