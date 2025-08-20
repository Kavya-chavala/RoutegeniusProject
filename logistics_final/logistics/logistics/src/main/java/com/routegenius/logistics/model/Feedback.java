// src/main/java/com/routegenius/logistics/model/Feedback.java
package com.routegenius.logistics.model;

import jakarta.persistence.*; // Use jakarta.persistence for Spring Boot 3+
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback") // Table name for feedback
@Data // Lombok: Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: Generates no-argument constructor
@AllArgsConstructor // Lombok: Generates constructor with all fields
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500) // Feedback text
    private String feedbackText;

    @Column(nullable = false)
    private Integer rating; // Star rating (e.g., 1 to 5)

    @ManyToOne(fetch = FetchType.LAZY) // Many feedback entries can belong to one user
    @JoinColumn(name = "user_id", nullable = false) // Foreign key to the users table
    private User user; // The user who submitted the feedback

    @OneToOne(fetch = FetchType.LAZY) // One feedback entry per parcel
    @JoinColumn(name = "parcel_id", nullable = false, unique = true) // Foreign key to parcels table, unique to ensure one feedback per parcel
    private Parcel parcel; // The parcel this feedback is for

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt; // Timestamp of submission

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }
}