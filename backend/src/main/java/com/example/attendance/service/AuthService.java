package com.example.attendance.service;

import com.example.attendance.dto.LoginRequest;
import com.example.attendance.dto.SignUpRequest;
import com.example.attendance.entity.Company;
import com.example.attendance.entity.Role;
import com.example.attendance.entity.User;
import com.example.attendance.repository.CompanyRepository;
import com.example.attendance.repository.UserRepository;
import com.example.attendance.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public User signUp(SignUpRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        if (companyRepository.findByName(signUpRequest.getCompanyName()).isPresent()) {
            throw new RuntimeException("Error: Company name is already in use!");
        }

        // Create and save the company
        Company company = new Company();
        company.setName(signUpRequest.getCompanyName());
        companyRepository.save(company);

        // Create and save the user
        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setName(signUpRequest.getUserName());
        user.setCompany(company);
        user.setRole(Role.ADMIN); // Assign ADMIN role to the first user of the company
        // In a real app, employeeId would be generated or assigned differently
        // For now, we can create a temporary one.
        user.setEmployeeId(signUpRequest.getUserName().toLowerCase() + "_" + company.getId());

        return userRepository.save(user);
    }

    public String login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        // Generate JWT token
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return jwtUtil.generateToken(userDetails);
    }
}
