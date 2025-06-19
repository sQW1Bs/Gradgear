package com.ecom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@gradgear.com");
        message.setTo(to);
        message.setSubject("GradGear - Your OTP for Account Verification");
        message.setText("Your OTP for GradGear account verification is: " + otp + 
                        "\n\nThis OTP will expire in 10 minutes.\n\nRegards,\nGradGear Team");
        
        mailSender.send(message);
    }
} 