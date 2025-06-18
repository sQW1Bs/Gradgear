package com.ecom.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path userImagesLocation;
    private final Path productImagesLocation;

    public FileStorageService(@Value("${file.storage.location:uploads}") String fileStorageLocation) {
        Path baseLocation = Paths.get(fileStorageLocation).toAbsolutePath().normalize();
        this.userImagesLocation = Paths.get(baseLocation.toString(), "users");
        this.productImagesLocation = Paths.get(baseLocation.toString(), "products");
        
        try {
            Files.createDirectories(this.userImagesLocation);
            Files.createDirectories(this.productImagesLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create the directories where the uploaded files will be stored.", e);
        }
    }

    public String storeUserImage(MultipartFile file, Long userId) {
        return storeFile(file, userImagesLocation, "user_" + userId + "_");
    }

    public String storeProductImage(MultipartFile file, Long productId) {
        return storeFile(file, productImagesLocation, "product_" + productId + "_");
    }
    
    public String storeUserImage(File file, Long userId) {
        return storeFile(file, userImagesLocation, "user_" + userId + "_");
    }

    public String storeProductImage(File file, Long productId) {
        return storeFile(file, productImagesLocation, "product_" + productId + "_");
    }

    private String storeFile(MultipartFile file, Path location, String prefix) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        
        String fileName = prefix + UUID.randomUUID() + fileExtension;

        try {
            Path targetLocation = location.resolve(fileName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + fileName, e);
        }
    }
    
    private String storeFile(File file, Path location, String prefix) {
        if (file == null || !file.exists()) {
            return null;
        }

        String originalFileName = file.getName();
        String fileExtension = "";
        
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        
        String fileName = prefix + UUID.randomUUID() + fileExtension;

        try {
            Path targetLocation = location.resolve(fileName);
            Files.copy(file.toPath(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + fileName, e);
        }
    }

    public byte[] loadUserImage(String fileName) {
        return loadFile(userImagesLocation.resolve(fileName));
    }

    public byte[] loadProductImage(String fileName) {
        return loadFile(productImagesLocation.resolve(fileName));
    }

    private byte[] loadFile(Path filePath) {
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not read file: " + filePath, e);
        }
    }

    public void deleteUserImage(String fileName) {
        deleteFile(userImagesLocation.resolve(fileName));
    }

    public void deleteProductImage(String fileName) {
        deleteFile(productImagesLocation.resolve(fileName));
    }

    private void deleteFile(Path filePath) {
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file: " + filePath, e);
        }
    }
} 