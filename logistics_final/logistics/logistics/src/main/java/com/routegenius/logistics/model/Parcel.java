package com.routegenius.logistics.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*; // Use jakarta.persistence for Spring Boot 3+

import java.time.LocalDateTime;

@Entity
@Table(name = "parcels")
@Data // Lombok: Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: Generates no-argument constructor
@AllArgsConstructor // Lombok: Generates constructor with all fields
public class Parcel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String trackingId; // Unique ID for tracking

    @Column(nullable = false)
    private String senderName;

    @Column(nullable = false, columnDefinition = "TEXT") // Use TEXT for potentially long addresses
    private String senderAddress;

    @Column(nullable = false)
    private String recipientName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String recipientAddress;

    @Column(nullable = false) // <--- NEW: Recipient Email must be stored for notifications and is required
    private String recipientEmail; // <--- NEW: This is the missing field

    @Column(columnDefinition = "TEXT") // Description is optional
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING) // Store enum as String in DB
    private ParcelStatus status;

    private String currentLocation; // Optional: current physical location

    @ManyToOne(fetch = FetchType.LAZY) // Many parcels can belong to one user
    @JoinColumn(name = "user_id", nullable = false) // Foreign key column
    private User user; // The user who owns/created this parcel

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) { // Default status if not set
            this.status = ParcelStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}