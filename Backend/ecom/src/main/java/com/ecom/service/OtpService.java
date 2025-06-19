package com.ecom.service;

import com.ecom.model.OtpVerification;
import com.ecom.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;
    
    @Autowired
    private EmailService emailService;
    
    // OTP validity period in minutes
    private static final int OTP_VALIDITY_MINUTES = 10;
    
    public String generateAndSendOtp(String email) {
        // Generate a 6-digit OTP
        String otp = generateOtp();
        
        // Save or update OTP in database
        Optional<OtpVerification> existingOtp = otpVerificationRepository.findByEmail(email);
        OtpVerification otpVerification;
        
        if (existingOtp.isPresent()) {
            otpVerification = existingOtp.get();
            otpVerification.setOtp(otp);
            otpVerification.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
            otpVerification.setVerified(false);
        } else {
            otpVerification = new OtpVerification(
                email, 
                otp, 
                LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES)
            );
        }
        
        otpVerificationRepository.save(otpVerification);
        
        // Send OTP via email
        emailService.sendOtpEmail(email, otp);
        
        return otp;
    }
    
    public boolean verifyOtp(String email, String otp) {
        Optional<OtpVerification> otpVerificationOpt = 
            otpVerificationRepository.findByEmailAndOtp(email, otp);
        
        if (otpVerificationOpt.isPresent()) {
            OtpVerification otpVerification = otpVerificationOpt.get();
            
            if (otpVerification.isExpired()) {
                return false;
            }
            
            otpVerification.setVerified(true);
            otpVerificationRepository.save(otpVerification);
            return true;
        }
        
        return false;
    }
    
    private String generateOtp() {
        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }
}
 