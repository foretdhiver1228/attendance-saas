package com.example.attendance.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class UserProfile {

    @Id
    private String employeeId; // 사번 (Employee ID) as primary key

    private String name; // 이름
    private String department; // 부서
    private String jobTitle; // 직무
    private String employmentType; // 고용형태 (정규/파트/알바)
    private double salary; // 급여
}
