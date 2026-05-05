package com.beepod.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

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

import com.beepod.backend.model.Space;
import com.beepod.backend.repository.SpaceRepository;

@RestController
@RequestMapping("/api/spaces")
public class SpaceController {

    @Autowired
    private SpaceRepository spaceRepository;

    // GET all spaces
    @GetMapping
    public List<Space> getAllSpaces() {
        return spaceRepository.findAll();
    }

    // GET spaces by city
    @GetMapping("/city/{city}")
    public List<Space> getSpacesByCity(@PathVariable String city) {
        return spaceRepository.findByCity(city);
    }

    // GET verified spaces only
    @GetMapping("/verified")
    public List<Space> getVerifiedSpaces() {
        return spaceRepository.findByIsVerifiedTrue();
    }

    // GET single space by id
    @GetMapping("/{id}")
    public Space getSpaceById(@PathVariable Long id) {
        return spaceRepository.findById(id).orElse(null);
    }

    // POST add a space
    @PostMapping
    public Space addSpace(@RequestBody Space space) {
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
    @GetMapping("/nearby")
public List<Space> getNearbySpaces(@RequestParam Double lat, @RequestParam Double lng, @RequestParam(defaultValue = "5") Double radius) {
    List<Space> allSpaces = spaceRepository.findAll();
    
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