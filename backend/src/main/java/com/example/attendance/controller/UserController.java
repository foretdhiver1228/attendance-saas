package com.example.attendance.controller;

import com.example.attendance.dto.PasswordChangeRequest;
import com.example.attendance.dto.UserUpdateRequest;
import com.example.attendance.entity.User;
import com.example.attendance.repository.UserRepository;
import com.example.attendance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(Authentication authentication, @RequestBody UserUpdateRequest updateRequest) {
        String email = authentication.getName();
        User updatedUser = userService.updateUserProfile(email, updateRequest);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/me/password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody PasswordChangeRequest passwordChangeRequest) {
        String email = authentication.getName();
        try {
            userService.changePassword(email, passwordChangeRequest);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<User> getUserByEmployeeId(@PathVariable String employeeId) {
        Optional<User> user = userRepository.findByEmployeeId(employeeId);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
