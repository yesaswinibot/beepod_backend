package com.beepod.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.beepod.backend.model.Space;

@Repository
public interface SpaceRepository extends JpaRepository<Space, Long> {
    List<Space> findByCity(String city);
    List<Space> findByIsVerifiedTrue();
}

