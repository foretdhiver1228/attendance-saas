package com.example.attendance.controller;

import com.example.attendance.entity.User;
import com.example.attendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')") // All methods in this controller require ADMIN role
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Helper to get current authenticated user's company ID
    private Long getCurrentUserCompanyId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return currentUser.getCompany().getId();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsersInCompany() {
        Long companyId = getCurrentUserCompanyId();
        List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getCompany() != null && user.getCompany().getId().equals(companyId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Long companyId = getCurrentUserCompanyId();
        Optional<User> user = userRepository.findById(id);
        return user.filter(u -> u.getCompany() != null && u.getCompany().getId().equals(companyId))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User currentUser = getCurrentUser();
        user.setCompany(currentUser.getCompany()); // Assign to current admin's company
        user.setPassword(passwordEncoder.encode(user.getPassword())); // Encode password
        if (user.getRole() == null) {
            user.setRole(com.example.attendance.entity.Role.EMPLOYEE); // Default role
        }
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    // For updating user details (e.g., role, department, etc.)
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Long companyId = getCurrentUserCompanyId();
        return userRepository.findById(id)
                .filter(user -> user.getCompany() != null && user.getCompany().getId().equals(companyId))
                .map(user -> {
                    user.setName(userDetails.getName());
                    user.setEmail(userDetails.getEmail());
                    user.setEmployeeId(userDetails.getEmployeeId());
                    user.setDepartment(userDetails.getDepartment());
                    user.setJobTitle(userDetails.getJobTitle());
                    user.setEmploymentType(userDetails.getEmploymentType());
                    user.setSalary(userDetails.getSalary());
                    user.setRole(userDetails.getRole()); // Allow admin to change role
                    // Password update should be handled separately or with care
                    if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                        user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                    }
                    return ResponseEntity.ok(userRepository.save(user));
                }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Long companyId = getCurrentUserCompanyId();
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent() && user.get().getCompany() != null && user.get().getCompany().getId().equals(companyId)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
