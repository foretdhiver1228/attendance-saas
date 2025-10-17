package com.example.attendance.service;

import com.example.attendance.dto.PasswordChangeRequest;
import com.example.attendance.dto.UserUpdateRequest;
import com.example.attendance.entity.User;
import com.example.attendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User updateUserProfile(String email, UserUpdateRequest updateRequest) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Update fields from the request
        if (updateRequest.getName() != null) {
            user.setName(updateRequest.getName());
        }
        if (updateRequest.getDepartment() != null) {
            user.setDepartment(updateRequest.getDepartment());
        }
        if (updateRequest.getJobTitle() != null) {
            user.setJobTitle(updateRequest.getJobTitle());
        }

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String email, PasswordChangeRequest passwordChangeRequest) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Verify old password
        if (!passwordEncoder.matches(passwordChangeRequest.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Old password does not match.");
        }

        // Encode and set new password
        user.setPassword(passwordEncoder.encode(passwordChangeRequest.getNewPassword()));
        userRepository.save(user);
    }
}
