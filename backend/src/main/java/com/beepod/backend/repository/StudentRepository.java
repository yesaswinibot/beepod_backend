package com.beepod.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.beepod.backend.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
}