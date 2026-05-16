package com.beepod.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.beepod.backend.model.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findBySpaceIdAndDate(Long spaceId, LocalDate date);
    Optional<Attendance> findByStudentIdAndSpaceIdAndDateAndCheckOutTimeIsNull(Long studentId, Long spaceId, LocalDate date);
    List<Attendance> findByStudentIdOrderByDateDesc(Long studentId);
}