package edu.cit.sampan.InventoryManangement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class Webconfig{

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Applies to all paths starting with /api/
                        .allowedOrigins("http://localhost:5173") // Your Vite-React development port
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP actions
                        .allowedHeaders("*") // Allows all headers (Content-Type, Authorization, etc.)
                        .allowCredentials(true);
            }
        };
    }
}