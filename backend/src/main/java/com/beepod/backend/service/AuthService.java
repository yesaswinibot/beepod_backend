package com.beepod.backend.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.beepod.backend.JwtUtil;
import com.beepod.backend.model.User;
import com.beepod.backend.repository.UserRepository;

@Service
public class AuthService {
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;


    public Map<String, String> register(User user) {
        Map<String, String> response = new HashMap<>();

        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if(existing.isPresent()) {
            response.put("error", "Email already registered");
            return response;
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("name", user.getName());
        return response;
    }

    public Map<String, String> login(String email, String password) {
        Map<String, String> response = new HashMap<>();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if(userOpt.isEmpty()) {
            response.put("error", "User not found");
            return response;
        }

        User user = userOpt.get();

        if(!passwordEncoder.matches(password, user.getPassword())) {
            response.put("error", "Incorrect password");
            return response;
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("name", user.getName());
        return response;
    }
    public Map<String, Object> checkPhone(String phone) {
    Map<String, Object> response = new HashMap<>();

    Optional<User> userOpt = userRepository.findByPhone(phone);
    if (userOpt.isEmpty()) {
        response.put("exists", false);
        return response;
    }

    User user = userOpt.get();
    String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
    response.put("exists", true);
    response.put("token", token);
    response.put("role", user.getRole());
    response.put("name", user.getName());
    return response;
}

}