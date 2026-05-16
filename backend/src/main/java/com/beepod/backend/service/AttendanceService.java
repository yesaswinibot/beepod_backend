package com.beepod.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.beepod.backend.model.Attendance;
import com.beepod.backend.repository.AttendanceRepository;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    public Map<String, Object> checkIn(Long studentId, Long spaceId) {
        Map<String, Object> response = new HashMap<>();
        LocalDate today = LocalDate.now();

        // Check if already checked in today (and not checked out)
        Optional<Attendance> existing = attendanceRepository
            .findByStudentIdAndSpaceIdAndDateAndCheckOutTimeIsNull(studentId, spaceId, today);

        if (existing.isPresent()) {
            response.put("error", "Already checked in today. Check out first.");
            response.put("attendance", existing.get());
            return response;
        }

        Attendance a = new Attendance();
        a.setStudentId(studentId);
        a.setSpaceId(spaceId);
        a.setCheckInTime(LocalDateTime.now());
        a.setDate(today);
        attendanceRepository.save(a);

        response.put("message", "Checked in successfully");
        response.put("attendance", a);
        return response;
    }

    public Map<String, Object> checkOut(Long studentId, Long spaceId) {
        Map<String, Object> response = new HashMap<>();
        LocalDate today = LocalDate.now();

        Optional<Attendance> existing = attendanceRepository
            .findByStudentIdAndSpaceIdAndDateAndCheckOutTimeIsNull(studentId, spaceId, today);

        if (existing.isEmpty()) {
            response.put("error", "No active check-in found for today.");
            return response;
        }

        Attendance a = existing.get();
        a.setCheckOutTime(LocalDateTime.now());
        attendanceRepository.save(a);

        response.put("message", "Checked out successfully");
        response.put("attendance", a);
        return response;
    }

    public List<Attendance> getTodayAttendance(Long spaceId) {
        return attendanceRepository.findBySpaceIdAndDate(spaceId, LocalDate.now());
    }

    public List<Attendance> getStudentHistory(Long studentId) {
        return attendanceRepository.findByStudentIdOrderByDateDesc(studentId);
    }
}