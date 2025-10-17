package com.example.attendance.controller;

import com.example.attendance.dto.LoginRequest;
import com.example.attendance.dto.MessageResponse;
import com.example.attendance.dto.SignUpRequest;
import com.example.attendance.entity.User;
import com.example.attendance.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<MessageResponse> registerUser(@RequestBody SignUpRequest signUpRequest) {
        try {
            User user = authService.signUp(signUpRequest);
            return ResponseEntity.ok(new MessageResponse("User registered successfully with ID: " + user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            String jwt = authService.login(loginRequest);
            return ResponseEntity.ok(jwt);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Invalid credentials"));
        }
    }
}