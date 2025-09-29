package com.example.attendance.controller;

import com.example.attendance.dto.AttendanceRequest;
import com.example.attendance.entity.Attendance;
import com.example.attendance.repository.AttendanceRepository;
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

    @MessageMapping("/attendance")
    @SendTo("/topic/attendance")
    public Attendance recordAttendance(AttendanceRequest attendanceRequest) throws Exception {
        Attendance attendance = new Attendance();
        attendance.setEmployeeId(attendanceRequest.getEmployeeId());
        attendance.setType(attendanceRequest.getType());
        attendance.setLatitude(attendanceRequest.getLatitude());
        attendance.setLongitude(attendanceRequest.getLongitude());
        attendance.setTimestamp(LocalDateTime.now());

        return attendanceRepository.save(attendance);
    }

    @GetMapping("/{employeeId}")
    public List<Attendance> getAttendanceByEmployeeId(@PathVariable String employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }
}
