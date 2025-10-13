package com.example.attendance.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "users") // "user" is often a reserved keyword in SQL
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String employeeId; // 사번 (Employee ID)

    private String name; // 이름
    private String department; // 부서
    private String jobTitle; // 직무
    private String employmentType; // 고용형태 (정규/파트/알바)
    private double salary; // 급여

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // User's role (e.g., ADMIN, EMPLOYEE)

    @JsonIgnore // Ignore during JSON serialization to prevent lazy loading issues
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
}
