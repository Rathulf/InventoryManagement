package edu.cit.sampan.InventoryManagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Grab the specific message we defined in our DTO (e.g., "Password must be at least 8 characters long")
        String errorMessage = ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        
        // Package it into a clean JSON object
        Map<String, String> response = new HashMap<>();
        response.put("message", errorMessage);
        
        // Send it back with the 400 Bad Request status
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}