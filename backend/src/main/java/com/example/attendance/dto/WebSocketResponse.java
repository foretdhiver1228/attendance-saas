package com.example.attendance.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WebSocketResponse<T> {
    private T data;
    private String error;
    private String employeeId; // To identify which user this response is for

    public static <T> WebSocketResponse<T> success(T data, String employeeId) {
        WebSocketResponse<T> response = new WebSocketResponse<>();
        response.setData(data);
        response.setEmployeeId(employeeId);
        return response;
    }

    public static <T> WebSocketResponse<T> error(String error, String employeeId) {
        WebSocketResponse<T> response = new WebSocketResponse<>();
        response.setError(error);
        response.setEmployeeId(employeeId);
        return response;
    }
}
