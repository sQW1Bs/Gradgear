package com.ecom.service;

import com.ecom.model.User;
import com.ecom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileStorageService fileStorageService;

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
} 