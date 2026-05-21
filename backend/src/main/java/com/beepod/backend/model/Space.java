package com.beepod.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "spaces")
public class Space {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private String city;
    private String description;
    private Integer totalSeats;
    private Integer dailyRate;
    private Integer monthlyRate;
    private String amenities;
    private Boolean isVerified = false;
    private Boolean isActive = true;

    @Column(nullable = true)
    private Double latitude;
    @Column(nullable = true)
    private Double longitude;

    @Column(name = "status")
    private String status = "pending";

    @Column(name = "owner_id")
    private Long ownerId;
    @Column(columnDefinition = "TEXT")
    private String photos;

    @Transient
    private Double distance;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Integer getDailyRate() { return dailyRate; }
    public void setDailyRate(Integer dailyRate) { this.dailyRate = dailyRate; }

    public Integer getMonthlyRate() { return monthlyRate; }
    public void setMonthlyRate(Integer monthlyRate) { this.monthlyRate = monthlyRate; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    
    public String getphotos(){
        return photos;
    }
    public void setphotos(String photos){
         this.photos=photos;
    }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }
}