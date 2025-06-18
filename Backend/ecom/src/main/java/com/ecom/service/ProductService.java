package com.ecom.service;

import com.ecom.model.Product;
import com.ecom.model.User;
import com.ecom.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private FileStorageService fileStorageService;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public List<Product> getProductsBySeller(User seller) {
        return productRepository.findBySeller(seller);
    }

    public Product createProduct(Product product, MultipartFile image) throws IOException {
        // First save the product to get an ID
        Product savedProduct = productRepository.save(product);
        
        if (image != null && !image.isEmpty()) {
            String fileName = fileStorageService.storeProductImage(image, savedProduct.getId());
            savedProduct.setImagePath(fileName);
            savedProduct = productRepository.save(savedProduct);
        }
        
        return savedProduct;
    }

    public Product updateProduct(Long id, Product updatedProduct, MultipartFile image) throws IOException {
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct == null) {
            return null;
        }

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());

        if (image != null && !image.isEmpty()) {
            // Delete old image if exists
            if (existingProduct.getImagePath() != null) {
                fileStorageService.deleteProductImage(existingProduct.getImagePath());
            }
            
            // Store new image
            String fileName = fileStorageService.storeProductImage(image, id);
            existingProduct.setImagePath(fileName);
        }

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        if (product != null && product.getImagePath() != null) {
            fileStorageService.deleteProductImage(product.getImagePath());
        }
        productRepository.deleteById(id);
    }
    
    public byte[] getProductImage(Long productId) {
        Product product = getProductById(productId);
        if (product != null && product.getImagePath() != null) {
            return fileStorageService.loadProductImage(product.getImagePath());
        }
        return null;
    }
} 