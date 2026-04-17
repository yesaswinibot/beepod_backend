package com.beepod.backend.controller;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.beepod.backend.model.Subscription;
import com.beepod.backend.repository.SubscriptionRepository;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    // GET all subscriptions for a space
    @GetMapping("/space/{spaceId}")
    public List<Subscription> getBySpace(@PathVariable Long spaceId) {
        return subscriptionRepository.findBySpaceId(spaceId);
    }

    // GET all subscriptions for a student
    @GetMapping("/student/{studentId}")
    public List<Subscription> getByStudent(@PathVariable Long studentId) {
        return subscriptionRepository.findByStudentId(studentId);
    }

    // GET active subscriptions for a space
    @GetMapping("/space/{spaceId}/active")
    public List<Subscription> getActiveBySpace(@PathVariable Long spaceId) {
        return subscriptionRepository.findBySpaceIdAndStatus(spaceId, "active");
    }

    // GET expiring subscriptions (next 7 days)
    @GetMapping("/space/{spaceId}/expiring")
    public List<Subscription> getExpiringBySpace(@PathVariable Long spaceId) {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysLater = today.plusDays(7);
        return subscriptionRepository.findBySpaceIdAndValidTillBetween(
            spaceId, today, sevenDaysLater
        );
    }

    // GET expired subscriptions
    @GetMapping("/space/{spaceId}/expired")
    public List<Subscription> getExpiredBySpace(@PathVariable Long spaceId) {
        return subscriptionRepository.findBySpaceIdAndValidTillBefore(
            spaceId, LocalDate.now()
        );
    }

    // POST add a subscription
    @PostMapping
    public Subscription addSubscription(@RequestBody Subscription subscription) {
        subscription.setStatus("active");
        return subscriptionRepository.save(subscription);
    }

    // PUT update payment status
    @PutMapping("/{id}/payment")
    public Subscription updatePayment(@PathVariable Long id, 
                                      @RequestParam String status,
                                      @RequestParam(required = false) String note) {
        Subscription sub = subscriptionRepository.findById(id).orElse(null);
        if(sub != null) {
            sub.setPaymentStatus(status);
            if(note != null) sub.setPaymentNote(note);
            subscriptionRepository.save(sub);
        }
        return sub;
    }

    // PUT renew subscription
    @PutMapping("/{id}/renew")
    public Subscription renewSubscription(@PathVariable Long id,
                                          @RequestBody Subscription updated) {
        Subscription sub = subscriptionRepository.findById(id).orElse(null);
        if(sub != null) {
            sub.setValidFrom(updated.getValidFrom());
            sub.setValidTill(updated.getValidTill());
            sub.setPaymentStatus(updated.getPaymentStatus());
            sub.setStatus("active");
            subscriptionRepository.save(sub);
        }
        return sub;
    }

    // DELETE subscription
    @DeleteMapping("/{id}")
    public String deleteSubscription(@PathVariable Long id) {
        subscriptionRepository.deleteById(id);
        return "Subscription deleted";
    }
}