package com.example.attendance.controller;

import com.example.attendance.entity.User;
import com.example.attendance.repository.UserRepository;
import com.example.attendance.service.AuthService;
import com.example.attendance.dto.SignUpRequest; // Assuming a DTO for user creation
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')") // Secure all endpoints in this controller for ADMIN role
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Endpoint to get all users (for admin)
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Endpoint to create a new user (by admin)
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User newUser) {
        // Ensure password is encoded before saving
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        User savedUser = userRepository.save(newUser);
        return ResponseEntity.ok(savedUser);
    }

    // Endpoint to update a user (by admin)
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUserData) {
        return userRepository.findById(id).map(user -> {
            user.setEmail(updatedUserData.getEmail());
            user.setName(updatedUserData.getName());
            user.setEmployeeId(updatedUserData.getEmployeeId());
            user.setDepartment(updatedUserData.getDepartment());
            user.setJobTitle(updatedUserData.getJobTitle());
            user.setEmploymentType(updatedUserData.getEmploymentType());
            user.setSalary(updatedUserData.getSalary());
            user.setRole(updatedUserData.getRole());

            // Only update password if a new one is provided
            if (updatedUserData.getPassword() != null && !updatedUserData.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(updatedUserData.getPassword()));
            }
            
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint to delete a user (by admin)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}