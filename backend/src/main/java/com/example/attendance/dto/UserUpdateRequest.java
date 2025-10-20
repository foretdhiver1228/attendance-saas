package com.example.attendance.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    private String name;
    private String employeeId;
    private String department;
    private String jobTitle;
    private String employmentType;
    private Double salary;
}
