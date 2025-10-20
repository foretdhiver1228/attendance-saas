import com.example.attendance.dto.AttendanceRequest;
import com.example.attendance.dto.WebSocketResponse;
import com.example.attendance.entity.Attendance;
import com.example.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

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

    @GetMapping("/{employeeId}")
    public List<Attendance> getAttendanceByEmployeeId(@PathVariable String employeeId) {
        return attendanceService.getAttendanceByEmployeeId(employeeId);
    }
}
