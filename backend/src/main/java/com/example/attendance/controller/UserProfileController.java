package com.example.attendance.controller;

import com.example.attendance.dto.UserProfileRequest;
import com.example.attendance.entity.UserProfile;
import com.example.attendance.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserProfileController {

    @Autowired
    private UserProfileRepository userProfileRepository;

    @PostMapping
    public UserProfile createUserProfile(@RequestBody UserProfileRequest request) {
        UserProfile userProfile = new UserProfile();
        userProfile.setEmployeeId(request.getEmployeeId());
        userProfile.setName(request.getName());
        userProfile.setDepartment(request.getDepartment());
        userProfile.setJobTitle(request.getJobTitle());
        userProfile.setEmploymentType(request.getEmploymentType());
        userProfile.setSalary(request.getSalary());
        return userProfileRepository.save(userProfile);
    }

    @GetMapping
    public List<UserProfile> getAllUserProfiles() {
        return userProfileRepository.findAll();
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<UserProfile> getUserProfileById(@PathVariable String employeeId) {
        Optional<UserProfile> userProfile = userProfileRepository.findById(employeeId);
        return userProfile.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{employeeId}")
    public ResponseEntity<UserProfile> updateUserProfile(@PathVariable String employeeId, @RequestBody UserProfileRequest request) {
        return userProfileRepository.findById(employeeId)
                .map(userProfile -> {
                    userProfile.setName(request.getName());
                    userProfile.setDepartment(request.getDepartment());
                    userProfile.setJobTitle(request.getJobTitle());
                    userProfile.setEmploymentType(request.getEmploymentType());
                    userProfile.setSalary(request.getSalary());
                    return ResponseEntity.ok(userProfileRepository.save(userProfile));
                }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{employeeId}")
    public ResponseEntity<Void> deleteUserProfile(@PathVariable String employeeId) {
        if (userProfileRepository.existsById(employeeId)) {
            userProfileRepository.deleteById(employeeId);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
