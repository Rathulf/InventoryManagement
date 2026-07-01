package edu.cit.sampan.InventoryManagement.config; // Ensure this matches your project package structure

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Explicitly activate our CORS bean configurations
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        
            // 2. Completely disable CSRF (Cross-Site Request Forgery) 
            // This is necessary since your frontend is on a different port and sending JSON payloads
            .csrf(csrf -> csrf.disable())
        
            // 3. Configure route permissions
            .authorizeHttpRequests(auth -> auth
            // Open up the auth endpoints to the public explicitly
            .requestMatchers("/api/auth/**").permitAll()
            // Make sure preflight OPTIONS requests bypass security checks completely
            .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
            // Any other routes require a valid authenticated user
            .anyRequest().authenticated()
        );

    return http.build();
}

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow your exact Vite frontend URL origin
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}