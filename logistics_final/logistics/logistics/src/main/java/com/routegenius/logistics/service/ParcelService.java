// src/main/java/com/routegenius/logistics/service/ParcelService.java
package com.routegenius.logistics.service;

import com.routegenius.logistics.exception.BadRequestException;
import com.routegenius.logistics.exception.ResourceNotFoundException;
import com.routegenius.logistics.model.Parcel;
import com.routegenius.logistics.model.ParcelStatus;
import com.routegenius.logistics.model.User;
import com.routegenius.logistics.Repository.ParcelRepository;
import com.routegenius.logistics.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime; // Ensure this is imported for timestamps
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors; // Added for stream operations, if not already present

@Service
public class ParcelService {

    private final ParcelRepository parcelRepository;
    private final UserRepository userRepository;
    private final EmailService emailService; // NEW: Inject EmailService

    // Constructor updated to include EmailService
    public ParcelService(ParcelRepository parcelRepository, UserRepository userRepository, EmailService emailService) {
        this.parcelRepository = parcelRepository;
        this.userRepository = userRepository;
        this.emailService = emailService; // Initialize new dependency
    }

    // --- Helper to generate unique Tracking ID ---
    private String generateUniqueTrackingId() {
        String trackingId = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        // Ensure uniqueness (though UUID collision is extremely rare)
        while (parcelRepository.findByTrackingId(trackingId).isPresent()) {
            trackingId = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        }
        return trackingId;
    }

    // --- Admin: Create Parcel ---
    @Transactional
    public Parcel createParcel(Parcel parcel, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        parcel.setTrackingId(generateUniqueTrackingId());
        parcel.setUser(user); // Associate parcel with the user
        parcel.setCreatedAt(LocalDateTime.now()); // Ensure timestamps are set
        parcel.setUpdatedAt(LocalDateTime.now()); // Ensure timestamps are set
        parcel.setStatus(ParcelStatus.PENDING); // Default status on creation

        Parcel createdParcel = parcelRepository.save(parcel);

        // NEW: Send email notification after creation
        String subject = "Your New Parcel Has Been Registered! - Tracking ID: " + createdParcel.getTrackingId();
        String body = String.format(
                "Dear %s,\n\n" +
                        "A new parcel has been registered for you.\n" +
                        "Tracking ID: %s\n" +
                        "Current Status: %s\n" +
                        "Description: %s\n\n" +
                        "You can track your parcel using the ID provided.\n\n" +
                        "Thank you for using RouteGenius!",
                createdParcel.getRecipientName(), // Use recipient name for personalized greeting
                createdParcel.getTrackingId(),
                createdParcel.getStatus().name(),
                createdParcel.getDescription() != null ? createdParcel.getDescription() : "N/A"
        );
        // Ensure recipientEmail is not null or empty before sending
        if (createdParcel.getRecipientEmail() != null && !createdParcel.getRecipientEmail().isEmpty()) {
            emailService.sendSimpleEmail(createdParcel.getRecipientEmail(), subject, body);
        } else {
            System.err.println("Recipient email is missing for parcel " + createdParcel.getTrackingId() + ". Email notification skipped.");
        }

        return createdParcel;
    }

    // --- Admin: Update Parcel ---
    @Transactional
    public Parcel updateParcel(Long id, Parcel updatedParcel) {
        Parcel existingParcel = parcelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parcel not found with ID: " + id));

        // Store old status for comparison if needed
        ParcelStatus oldStatus = existingParcel.getStatus();

        existingParcel.setSenderName(updatedParcel.getSenderName());
        existingParcel.setSenderAddress(updatedParcel.getSenderAddress());
        existingParcel.setRecipientName(updatedParcel.getRecipientName());
        existingParcel.setRecipientAddress(updatedParcel.getRecipientAddress());
        existingParcel.setRecipientEmail(updatedParcel.getRecipientEmail());
        existingParcel.setDescription(updatedParcel.getDescription());
        existingParcel.setCurrentLocation(updatedParcel.getCurrentLocation());
        existingParcel.setUpdatedAt(LocalDateTime.now()); // Update timestamp

        if (updatedParcel.getStatus() != null) {
            existingParcel.setStatus(updatedParcel.getStatus());
        }

        Parcel savedParcel = parcelRepository.save(existingParcel);

        // NEW: Send email notification after update
        // You can add conditions here (e.g., only send if status changed: if (!oldStatus.equals(savedParcel.getStatus())))
        String subject = "Parcel Update Notification - Tracking ID: " + savedParcel.getTrackingId();
        String body = String.format(
                "Dear %s,\n\n" +
                        "Your parcel with Tracking ID %s has been updated.\n" +
                        "New Status: %s\n" +
                        "Current Location: %s\n" +
                        "Description: %s\n\n" +
                        "You can track your parcel using the ID provided.\n\n" +
                        "Thank you for using RouteGenius!",
                savedParcel.getRecipientName(),
                savedParcel.getTrackingId(),
                savedParcel.getStatus().name(),
                savedParcel.getCurrentLocation() != null ? savedParcel.getCurrentLocation() : "N/A",
                savedParcel.getDescription() != null ? savedParcel.getDescription() : "N/A"
        );
        // Ensure recipientEmail is not null or empty before sending
        if (savedParcel.getRecipientEmail() != null && !savedParcel.getRecipientEmail().isEmpty()) {
            emailService.sendSimpleEmail(savedParcel.getRecipientEmail(), subject, body);
        } else {
            System.err.println("Recipient email is missing for parcel " + savedParcel.getTrackingId() + ". Email notification skipped.");
        }

        return savedParcel;
    }

    // --- Admin: Get All Parcels (old method - will be replaced by getPaginatedParcels in controller) ---
    public List<Parcel> getAllParcels() {
        return parcelRepository.findAll();
    }

    // --- Get Paginated and Searchable Parcels ---
    public Page<Parcel> getPaginatedParcels(Pageable pageable, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return parcelRepository.findAll(pageable);
        } else {
            Specification<Parcel> spec = (root, query, criteriaBuilder) -> {
                String likePattern = "%" + searchTerm.toLowerCase() + "%";
                return criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("trackingId")), likePattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("senderName")), likePattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("recipientName")), likePattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("recipientEmail")), likePattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("currentLocation")), likePattern)
                );
            };
            return parcelRepository.findAll(spec, pageable);
        }
    }

    // --- User: Get Parcels by User ID (view their own parcels) ---
    public List<Parcel> getParcelsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return parcelRepository.findByUserId(userId);
    }

    // --- Public/User: Get Parcel by Tracking ID ---
    public Optional<Parcel> getParcelByTrackingId(String trackingId) {
        return parcelRepository.findByTrackingId(trackingId);
    }

    // --- Admin: Delete Parcel ---
    @Transactional
    public void deleteParcel(Long id) {
        if (!parcelRepository.existsById(id)) {
            throw new ResourceNotFoundException("Parcel not found with ID: " + id);
        }
        parcelRepository.deleteById(id);
    }
}