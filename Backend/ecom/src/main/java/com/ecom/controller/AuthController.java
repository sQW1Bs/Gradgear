package com.ecom.controller;

import com.ecom.model.User;
import com.ecom.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        User user = userService.authenticate(email, password);
        if (user == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/signup/initiate")
    public ResponseEntity<?> initiateSignup(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            userService.initiateSignup(email);
            response.put("message", "OTP sent successfully to your email");
            response.put("email", email);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("message", "Failed to send OTP. Please try again later.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PostMapping("/signup/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        Map<String, Object> response = new HashMap<>();
        
        boolean isValid = userService.verifyOtp(email, otp);
        
        if (isValid) {
            response.put("message", "OTP verified successfully");
            response.put("email", email);
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Invalid or expired OTP");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/signup/complete")
    public ResponseEntity<?> completeSignup(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String name = request.get("name");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User user = userService.completeSignup(email, password, name);
            
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("message", "Account created successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to create account. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
} 