package com.ecom.controller;

import com.ecom.model.Order;
import com.ecom.model.Product;
import com.ecom.model.User;
import com.ecom.service.OrderService;
import com.ecom.service.ProductService;
import com.ecom.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    @Autowired
    private OrderService orderService;
    @Autowired
    private UserService userService;
    @Autowired
    private ProductService productService;

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        List<?> productIdsRaw = (List<?>) payload.get("productIds");
        List<Long> productIds = productIdsRaw.stream()
            .map(id -> Long.valueOf(id.toString()))
            .collect(Collectors.toList());
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        for (Long pid : productIds) {
            Product product = productService.getProductById(pid);
            if (product != null) {
                orderService.createOrder(user, product);
                productService.deleteProduct(product.getId());
            }
        }
        return ResponseEntity.ok("Order placed successfully");
    }
} 