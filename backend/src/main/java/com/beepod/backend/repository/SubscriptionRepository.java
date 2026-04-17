package com.beepod.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.beepod.backend.model.Subscription;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    List<Subscription> findBySpaceId(Long spaceId);
    
    List<Subscription> findByStudentId(Long studentId);
    
    List<Subscription> findBySpaceIdAndStatus(Long spaceId, String status);
    
    List<Subscription> findBySpaceIdAndValidTillBefore(Long spaceId, LocalDate date);
    
    List<Subscription> findBySpaceIdAndValidTillBetween(Long spaceId, LocalDate start, LocalDate end);
}


