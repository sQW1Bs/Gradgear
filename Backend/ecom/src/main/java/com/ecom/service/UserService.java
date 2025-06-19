package com.ecom.service;

import com.ecom.model.User;
import com.ecom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private OtpService otpService;
    
    @Autowired
    private ProductService productService;

    public User authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt.get();
        }
        return null;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    
    public boolean isEmailRegistered(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public boolean isValidAmritaEmail(String email) {
        return email != null && email.endsWith("@am.students.amrita.edu");
    }
    
    public String initiateSignup(String email) {
        if (!isValidAmritaEmail(email)) {
            throw new IllegalArgumentException("Only @am.students.amrita.edu email addresses are allowed");
        }
        
        if (isEmailRegistered(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }
        
        // Generate and send OTP
        return otpService.generateAndSendOtp(email);
    }
    
    public boolean verifyOtp(String email, String otp) {
        return otpService.verifyOtp(email, otp);
    }
    
    public User completeSignup(String email, String password, String name) {
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(password);
        newUser.setName(name);
        
        return userRepository.save(newUser);
    }

    public User updateProfile(Long userId, User updatedUser, MultipartFile profileImage) throws IOException {
        User existingUser = userRepository.findById(userId).orElse(null);
        if (existingUser == null) {
            return null;
        }

        existingUser.setName(updatedUser.getName());
        existingUser.setProgramme(updatedUser.getProgramme());
        existingUser.setBranch(updatedUser.getBranch());
        existingUser.setYear(updatedUser.getYear());
        existingUser.setSemester(updatedUser.getSemester());
        existingUser.setPhoneNo(updatedUser.getPhoneNo());

        if (profileImage != null && !profileImage.isEmpty()) {
            // Delete old image if exists
            if (existingUser.getProfileImagePath() != null) {
                fileStorageService.deleteUserImage(existingUser.getProfileImagePath());
            }
            
            // Store new image
            String fileName = fileStorageService.storeUserImage(profileImage, userId);
            existingUser.setProfileImagePath(fileName);
        }

        return userRepository.save(existingUser);
    }
    
    public byte[] getUserProfileImage(Long userId) {
        User user = getUserById(userId);
        if (user != null && user.getProfileImagePath() != null) {
            return fileStorageService.loadUserImage(user.getProfileImagePath());
        }
        return null;
    }
    
    @Transactional
    public boolean deleteUser(Long userId) {
        User user = getUserById(userId);
        if (user == null) {
            return false;
        }
        
        // Delete all products associated with the user
        productService.deleteAllProductsByUser(user);
        
        // Delete user profile image if exists
        if (user.getProfileImagePath() != null) {
            fileStorageService.deleteUserImage(user.getProfileImagePath());
        }
        
        // Delete user from database
        userRepository.delete(user);
        
        return true;
    }
} 