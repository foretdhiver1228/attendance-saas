package com.example.attendance.dto;

import lombok.Data;

@Data
public class CompanyLocationUpdateRequest {
    private Double latitude;
    private Double longitude;
    private Double geofenceRadius;
}
