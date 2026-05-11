package com.beepod.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.beepod.backend.model.User;
import com.beepod.backend.service.AuthService;
import com.beepod.backend.service.EmailOtpService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailOtpService emailOtpService;

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        return authService.login(email, password);
    }

    @GetMapping("/check-phone")
    public Map<String, Object> checkPhone(@RequestParam String phone) {
        return authService.checkPhone(phone);
    }

    @PostMapping("/send-email-otp")
    public Map<String, String> sendEmailOtp(@RequestBody Map<String, String> body) {
        return emailOtpService.sendOtp(body.get("email"));
    }

    @PostMapping("/verify-email-otp")
    public Map<String, Object> verifyEmailOtp(@RequestBody Map<String, String> body) {
        return emailOtpService.verifyOtp(body.get("email"), body.get("otp"));
    }
}