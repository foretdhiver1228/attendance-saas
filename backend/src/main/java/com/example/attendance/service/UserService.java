package com.example.attendance.service;

import com.example.attendance.dto.CompanyLocationUpdateRequest;
import com.example.attendance.dto.PasswordChangeRequest;
import com.example.attendance.dto.UserUpdateRequest;
import com.example.attendance.entity.Company;
import com.example.attendance.entity.User;
import com.example.attendance.repository.CompanyRepository;
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
    private CompanyRepository companyRepository;

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
        if (updateRequest.getEmployeeId() != null) {
            user.setEmployeeId(updateRequest.getEmployeeId());
        }
        if (updateRequest.getDepartment() != null) {
            user.setDepartment(updateRequest.getDepartment());
        }
        if (updateRequest.getJobTitle() != null) {
            user.setJobTitle(updateRequest.getJobTitle());
        }
        if (updateRequest.getEmploymentType() != null) {
            user.setEmploymentType(updateRequest.getEmploymentType());
        }
        if (updateRequest.getSalary() != null) {
            user.setSalary(updateRequest.getSalary());
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

    @Transactional
    public Company updateCompanyLocation(String email, CompanyLocationUpdateRequest locationRequest) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        Company company = user.getCompany();
        if (company == null) {
            throw new IllegalStateException("User is not associated with a company.");
        }

        company.setLatitude(locationRequest.getLatitude());
        company.setLongitude(locationRequest.getLongitude());
        company.setGeofenceRadius(locationRequest.getGeofenceRadius());

        return companyRepository.save(company);
    }
}
