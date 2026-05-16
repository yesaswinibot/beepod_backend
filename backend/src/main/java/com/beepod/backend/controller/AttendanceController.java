package com.beepod.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.beepod.backend.model.Attendance;
import com.beepod.backend.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/checkin")
    public Map<String, Object> checkIn(@RequestParam Long studentId, @RequestParam Long spaceId) {
        return attendanceService.checkIn(studentId, spaceId);
    }

    @PostMapping("/checkout")
    public Map<String, Object> checkOut(@RequestParam Long studentId, @RequestParam Long spaceId) {
        return attendanceService.checkOut(studentId, spaceId);
    }

    @GetMapping("/today/{spaceId}")
    public List<Attendance> getTodayAttendance(@PathVariable Long spaceId) {
        return attendanceService.getTodayAttendance(spaceId);
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> getStudentHistory(@PathVariable Long studentId) {
        return attendanceService.getStudentHistory(studentId);
    }
}