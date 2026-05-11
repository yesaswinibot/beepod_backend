package com.beepod.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.beepod.backend.JwtUtil;
import com.beepod.backend.model.EmailOtp;
import com.beepod.backend.model.User;
import com.beepod.backend.repository.EmailOtpRepository;
import com.beepod.backend.repository.UserRepository;

@Service
public class EmailOtpService {

    @Autowired
    private EmailOtpRepository emailOtpRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, String> sendOtp(String email) {
        Map<String, String> response = new HashMap<>();

        String otp = String.format("%06d", new Random().nextInt(999999));

        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(email);
        emailOtp.setOtp(otp);
        emailOtp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        emailOtp.setUsed(false);
        emailOtpRepository.save(emailOtp);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your BeePod OTP");
            message.setText("Hi! Your BeePod verification code is: " + otp + "\n\nThis code expires in 5 minutes.\n\n🐝 BeePod Team");
            mailSender.send(message);
            response.put("message", "OTP sent successfully");
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("EMAIL SEND ERROR: " + e.getMessage());
            response.put("error", "Failed to send email: " + e.getMessage());
        }

        return response;
    }

    public Map<String, Object> verifyOtp(String email, String otp) {
        Map<String, Object> response = new HashMap<>();

        Optional<EmailOtp> otpOpt = emailOtpRepository.findTopByEmailOrderByExpiresAtDesc(email);

        if (otpOpt.isEmpty()) {
            response.put("error", "No OTP found. Request a new one.");
            return response;
        }

        EmailOtp emailOtp = otpOpt.get();

        if (emailOtp.isUsed()) {
            response.put("error", "OTP already used. Request a new one.");
            return response;
        }

        if (LocalDateTime.now().isAfter(emailOtp.getExpiresAt())) {
            response.put("error", "OTP expired. Request a new one.");
            return response;
        }

        if (!emailOtp.getOtp().equals(otp)) {
            response.put("error", "Incorrect OTP.");
            return response;
        }

        emailOtp.setUsed(true);
        emailOtpRepository.save(emailOtp);

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
            response.put("exists", true);
            response.put("token", token);
            response.put("role", user.getRole());
            response.put("name", user.getName());
        } else {
            response.put("exists", false);
        }

        return response;
    }
}