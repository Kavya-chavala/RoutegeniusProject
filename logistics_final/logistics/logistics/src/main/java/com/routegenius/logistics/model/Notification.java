// src/main/java/com/routegenius/logistics/model/Notification.java
package com.routegenius.logistics.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications") // Table name for notifications
@Data // Lombok: Generates getters, setters, equals, hashCode, and toString
@NoArgsConstructor // Lombok: Generates a no-argument constructor
@AllArgsConstructor // Lombok: Generates a constructor with all fields
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // Many notifications can belong to one user
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // The user who receives the notification

    @ManyToOne(fetch = FetchType.LAZY) // Many notifications can be about one parcel
    @JoinColumn(name = "parcel_id", nullable = false)
    private Parcel parcel; // The parcel the notification is about

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message; // The actual notification text (e.g., "Parcel DELIVERED: ABC123DEF456")

    @Column(nullable = false)
    private boolean isRead = false; // Flag to check if the user has read the notification

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}