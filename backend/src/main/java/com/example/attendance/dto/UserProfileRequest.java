package com.example.attendance.dto;

import lombok.Data;

@Data
public class UserProfileRequest {
    private String employeeId;
    private String name;
    private String department;
    private String jobTitle;
    private String employmentType;
    private double salary;
}
