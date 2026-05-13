package com.beepod.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.beepod.backend.model.Space;
import com.beepod.backend.repository.SpaceRepository;

@RestController
@RequestMapping("/api/spaces")
public class SpaceController {

    @Autowired
    private SpaceRepository spaceRepository;

    // GET all spaces (everything, all statuses)
    @GetMapping
    public List<Space> getAllSpaces() {
        return spaceRepository.findAll();
    }

    // GET spaces by city
    @GetMapping("/city/{city}")
    public List<Space> getSpacesByCity(@PathVariable String city) {
        return spaceRepository.findByCity(city);
    }

    // GET only verified spaces (for students)
    @GetMapping("/verified")
    public List<Space> getVerifiedSpaces() {
        return spaceRepository.findByStatus("verified");
    }

    // GET owner's own spaces (any status)
    @GetMapping("/my")
    public List<Space> getMySpaces(@RequestParam Long ownerId) {
        return spaceRepository.findByOwnerId(ownerId);
    }

    // GET single space by id
    @GetMapping("/{id}")
    public Space getSpaceById(@PathVariable Long id) {
        return spaceRepository.findById(id).orElse(null);
    }

    // POST add a space (auto-pending)
    @PostMapping
    public Space addSpace(@RequestBody Space space) {
        space.setStatus("pending");
        space.setIsVerified(false);
        return spaceRepository.save(space);
    }

    // PUT update a space
    @PutMapping("/{id}")
    public Space updateSpace(@PathVariable Long id, @RequestBody Space updatedSpace) {
        updatedSpace.setId(id);
        return spaceRepository.save(updatedSpace);
    }

    // DELETE a space
    @DeleteMapping("/{id}")
    public String deleteSpace(@PathVariable Long id) {
        spaceRepository.deleteById(id);
        return "Space deleted successfully";
    }

    // Nearby spaces (only verified)
    @GetMapping("/nearby")
    public List<Space> getNearbySpaces(@RequestParam Double lat, @RequestParam Double lng, @RequestParam(defaultValue = "5") Double radius) {
        List<Space> allSpaces = spaceRepository.findByStatus("verified");

        return allSpaces.stream()
            .filter(space -> space.getLatitude() != null && space.getLongitude() != null)
            .map(space -> {
                double distance = calculateDistance(lat, lng, space.getLatitude(), space.getLongitude());
                space.setDistance(distance);
                return space;
            })
            .filter(space -> space.getDistance() <= radius)
            .sorted((a, b) -> Double.compare(a.getDistance(), b.getDistance()))
            .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}