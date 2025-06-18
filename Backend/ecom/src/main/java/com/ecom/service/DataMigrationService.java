package com.ecom.service;

import com.ecom.model.Product;
import com.ecom.model.User;
import com.ecom.repository.ProductRepository;
import com.ecom.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class DataMigrationService {
    
    private static final Logger logger = LoggerFactory.getLogger(DataMigrationService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Value("${file.storage.location:uploads}")
    private String fileStorageLocation;
    
    @PostConstruct
    @Transactional
    public void migrateImageData() {
        logger.info("Starting image data migration...");
        
        try {
            migrateUserImages();
            migrateProductImages();
            logger.info("Image data migration completed successfully.");
        } catch (Exception e) {
            logger.error("Error during image data migration", e);
        }
    }
    
    private void migrateUserImages() throws Exception {
        logger.info("Migrating user profile images...");
        List<User> users = userRepository.findAll();
        int count = 0;
        
        for (User user : users) {
            byte[] imageData = getImageDataFromUser(user);
            if (imageData != null && imageData.length > 0) {
                // Create a temporary file and save it
                Path tempFile = Files.createTempFile("user_image_", ".jpg");
                Files.write(tempFile, imageData);
                
                // Use the FileStorageService to store the file properly
                String fileName = fileStorageService.storeUserImage(tempFile.toFile(), user.getId());
                user.setProfileImagePath(fileName);
                userRepository.save(user);
                
                // Clean up the temp file
                Files.delete(tempFile);
                count++;
            }
        }
        
        logger.info("Migrated {} user profile images.", count);
    }
    
    private void migrateProductImages() throws Exception {
        logger.info("Migrating product images...");
        List<Product> products = productRepository.findAll();
        int count = 0;
        
        for (Product product : products) {
            byte[] imageData = getImageDataFromProduct(product);
            if (imageData != null && imageData.length > 0) {
                // Create a temporary file and save it
                Path tempFile = Files.createTempFile("product_image_", ".jpg");
                Files.write(tempFile, imageData);
                
                // Use the FileStorageService to store the file properly
                String fileName = fileStorageService.storeProductImage(tempFile.toFile(), product.getId());
                product.setImagePath(fileName);
                productRepository.save(product);
                
                // Clean up the temp file
                Files.delete(tempFile);
                count++;
            }
        }
        
        logger.info("Migrated {} product images.", count);
    }
    
    // Use reflection to access the old image field (which might not be accessible after model changes)
    private byte[] getImageDataFromUser(User user) {
        try {
            Field field = User.class.getDeclaredField("profileImage");
            field.setAccessible(true);
            return (byte[]) field.get(user);
        } catch (Exception e) {
            logger.warn("Could not access profileImage field for user {}", user.getId());
            return null;
        }
    }
    
    private byte[] getImageDataFromProduct(Product product) {
        try {
            Field field = Product.class.getDeclaredField("image");
            field.setAccessible(true);
            return (byte[]) field.get(product);
        } catch (Exception e) {
            logger.warn("Could not access image field for product {}", product.getId());
            return null;
        }
    }
} 