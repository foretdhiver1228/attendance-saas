package com.example.attendance.controller;

import com.example.attendance.dto.AttendanceRequest;
import com.example.attendance.entity.Attendance;
import com.example.attendance.entity.User;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/attendance")
    @SendTo("/topic/attendance")
    public Attendance recordAttendance(AttendanceRequest attendanceRequest) throws Exception {
        User user = userRepository.findByEmployeeId(attendanceRequest.getEmployeeId())
                .orElseThrow(() -> new Exception("User not found with employeeId: " + attendanceRequest.getEmployeeId()));

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setType(attendanceRequest.getType());
        attendance.setLatitude(attendanceRequest.getLatitude());
        attendance.setLongitude(attendanceRequest.getLongitude());
        attendance.setTimestamp(LocalDateTime.now());

        return attendanceRepository.save(attendance);
    }

    @GetMapping("/{employeeId}")
    public List<Attendance> getAttendanceByEmployeeId(@PathVariable String employeeId) {
        return attendanceRepository.findByUser_EmployeeId(employeeId);
    }
}
