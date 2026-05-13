package com.beepod.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
    private JwtUtil jwtUtil;

    @Value("${RESEND_API_KEY}")
    private String resendApiKey;

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
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("from", "BeePod <onboarding@resend.dev>");
            body.put("to", new String[]{email});
            body.put("subject", "Your BeePod OTP");
            body.put("text", "Hi! Your BeePod verification code is: " + otp + "\n\nThis code expires in 5 minutes.\n\n🐝 BeePod Team");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForObject("https://api.resend.com/emails", request, String.class);

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

        if (otpOpt.isEmpty()) { response.put("error", "No OTP found. Request a new one."); return response; }

        EmailOtp emailOtp = otpOpt.get();

        if (emailOtp.isUsed()) { response.put("error", "OTP already used. Request a new one."); return response; }
        if (LocalDateTime.now().isAfter(emailOtp.getExpiresAt())) { response.put("error", "OTP expired. Request a new one."); return response; }
        if (!emailOtp.getOtp().equals(otp)) { response.put("error", "Incorrect OTP."); return response; }

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