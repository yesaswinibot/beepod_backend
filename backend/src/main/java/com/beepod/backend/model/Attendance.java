package com.beepod.backend.model;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
 @Entity
 @Table(name = "attendance")

public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

   @Column(name = "student_id")
    private Long studentId;

    @Column(name = "space_id")
    private Long spaceId;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    private LocalDate date;

    public Long getId() { return id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getSpaceId() { return spaceId; }
    public void setSpaceId(Long spaceId) { this.spaceId = spaceId; }
    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }
    public LocalDateTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalDateTime checkOutTime) { this.checkOutTime = checkOutTime; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
}
