package com.beepod.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
}