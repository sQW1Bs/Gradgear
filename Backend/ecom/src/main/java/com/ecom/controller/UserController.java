package com.ecom.controller;

import com.ecom.model.User;
import com.ecom.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("programme", user.getProgramme());
        response.put("branch", user.getBranch());
        response.put("year", user.getYear());
        response.put("semester", user.getSemester());
        response.put("phoneNo", user.getPhoneNo());
        response.put("hasProfileImage", user.hasProfileImage());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/profile-image")
    public ResponseEntity<?> getProfileImage(@PathVariable Long id) {
        byte[] imageData = userService.getUserProfileImage(id);
        if (imageData == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(imageData);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestPart("user") User updatedUser,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        try {
            User result = userService.updateProfile(id, updatedUser, profileImage);
            if (result == null) {
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", result.getId());
            response.put("email", result.getEmail());
            response.put("name", result.getName());
            response.put("programme", result.getProgramme());
            response.put("branch", result.getBranch());
            response.put("year", result.getYear());
            response.put("semester", result.getSemester());
            response.put("phoneNo", result.getPhoneNo());
            response.put("hasProfileImage", result.hasProfileImage());
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update profile");
        }
    }
} 