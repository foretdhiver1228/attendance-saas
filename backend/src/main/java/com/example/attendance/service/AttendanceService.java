package com.example.attendance.service;

import com.example.attendance.dto.AttendanceRequest;
import com.example.attendance.entity.Attendance;
import com.example.attendance.entity.Company;
import com.example.attendance.entity.User;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.UserRepository;
import com.example.attendance.util.LocationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Attendance recordAttendance(AttendanceRequest attendanceRequest) throws Exception {
        User user = userRepository.findByEmployeeId(attendanceRequest.getEmployeeId())
                .orElseThrow(() -> new Exception("User not found with employeeId: " + attendanceRequest.getEmployeeId()));

        Company company = user.getCompany();

        // Geofencing validation
        if (company.getLatitude() != null && company.getLongitude() != null && company.getGeofenceRadius() != null) {
            if (attendanceRequest.getLatitude() == null || attendanceRequest.getLongitude() == null) {
                throw new Exception("Location information is required for check-in.");
            }

            double distance = LocationUtil.calculateDistance(
                    company.getLatitude(),
                    company.getLongitude(),
                    attendanceRequest.getLatitude(),
                    attendanceRequest.getLongitude()
            );

            if (distance > company.getGeofenceRadius()) {
                throw new Exception("You are outside the allowed check-in area.");
            }
        }

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setType(attendanceRequest.getType());
        attendance.setLatitude(attendanceRequest.getLatitude());
        attendance.setLongitude(attendanceRequest.getLongitude());
        attendance.setTimestamp(LocalDateTime.now());

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAttendanceByEmployeeId(String employeeId) {
        return attendanceRepository.findByUser_EmployeeId(employeeId);
    }
}
