package com.example.attendance.controller;

import com.example.attendance.dto.AttendanceRequest;
import com.example.attendance.dto.WebSocketResponse;
import com.example.attendance.entity.Attendance;
import com.example.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class AttendanceWsController {

    @Autowired
    private AttendanceService attendanceService;

    @MessageMapping("/attendance")
    @SendTo("/topic/attendance")
    public WebSocketResponse<Attendance> recordAttendance(AttendanceRequest attendanceRequest) {
        try {
            Attendance newAttendance = attendanceService.recordAttendance(attendanceRequest);
            return WebSocketResponse.success(newAttendance, attendanceRequest.getEmployeeId());
        } catch (Exception e) {
            return WebSocketResponse.error(e.getMessage(), attendanceRequest.getEmployeeId());
        }
    }
}
