package com.ecom.service;

import com.ecom.model.Order;
import com.ecom.model.Product;
import com.ecom.model.User;
import com.ecom.repository.OrderRepository;
import com.ecom.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ProductRepository productRepository;

    public Order createOrder(User user, Product product) {
        Order order = new Order(user, product, LocalDateTime.now());
        return orderRepository.save(order);
    }
} 