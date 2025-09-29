package com.example.attendance.dto;

import lombok.Data;

@Data
public class AttendanceRequest {
    private String employeeId;
    private String type;
    private double latitude;
    private double longitude;
}
