// src/main/java/com/routegenius/logistics/controller/FeedbackController.java
package com.routegenius.logistics.controller;

import com.routegenius.logistics.model.Feedback; // Import the Feedback entity
import com.routegenius.logistics.payload.FeedbackRequest; // Import the FeedbackRequest DTO
import com.routegenius.logistics.payload.FeedbackResponse; // Import the FeedbackResponse DTO
import com.routegenius.logistics.service.FeedbackService; // Import the FeedbackService
import com.routegenius.logistics.security.CustomUserDetails; // To get the authenticated user's ID

import jakarta.validation.Valid; // Import for validation annotations
import org.springframework.http.HttpStatus; // Import HTTP status codes
import org.springframework.http.ResponseEntity; // Import ResponseEntity for building HTTP responses
import org.springframework.security.access.prepost.PreAuthorize; // Import for method-level security
import org.springframework.security.core.Authentication; // Import to get current authenticated user
import org.springframework.web.bind.annotation.*; // Import common Spring Web annotations

import java.util.List; // Import List for collections
import java.util.stream.Collectors; // Import for stream operations

@RestController // Marks this class as a Spring REST Controller
@RequestMapping("/api/feedback") // Base path for all endpoints in this controller
@CrossOrigin(origins = "http://localhost:3000") // Allows requests from your React frontend
public class FeedbackController {

    private final FeedbackService feedbackService; // Inject FeedbackService

    // Constructor for dependency injection
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Helper method to map a Feedback entity to a FeedbackResponse DTO
    // This is used to transform the database entity into a clean response object for the frontend
    private FeedbackResponse mapFeedbackToResponse(Feedback feedback) {
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getFeedbackText(),
                feedback.getRating(),
                feedback.getUser().getId(), // Get user ID from the associated User entity
                feedback.getUser().getUsername(), // Get username from the associated User entity
                feedback.getParcel().getId(), // Get parcel ID from the associated Parcel entity
                feedback.getParcel().getTrackingId(), // Get tracking ID from the associated Parcel entity
                feedback.getSubmittedAt()
        );
    }

    // --- API Endpoint: User Submits Feedback ---
    // Handles POST requests to /api/feedback
    @PostMapping
    // @PreAuthorize ensures that only authenticated users (USER or ADMIN roles) can submit feedback
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @Valid @RequestBody FeedbackRequest feedbackRequest, // Request body contains feedback data, @Valid enables validation
            Authentication authentication) { // Spring Security's Authentication object for current user

        // Get the ID of the currently authenticated user from the security context
        CustomUserDetails currentUser = (CustomUserDetails) authentication.getPrincipal();
        Long userId = currentUser.getId();

        // Call the service layer to handle the feedback submission logic
        Feedback submittedFeedback = feedbackService.submitFeedback(
                userId,
                feedbackRequest.getParcelId(),
                feedbackRequest.getFeedbackText(),
                feedbackRequest.getRating()
        );
        // Return a 201 Created status with the submitted feedback details
        return ResponseEntity.status(HttpStatus.CREATED).body(mapFeedbackToResponse(submittedFeedback));
    }

    // --- API Endpoint: Admin Gets All Feedback ---
    // Handles GET requests to /api/feedback
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Only users with the ADMIN role can view all feedback
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {
        // Call the service layer to retrieve all feedback entries
        List<Feedback> feedbackList = feedbackService.getAllFeedback();
        // Convert the list of Feedback entities to a list of FeedbackResponse DTOs
        List<FeedbackResponse> responses = feedbackList.stream()
                .map(this::mapFeedbackToResponse)
                .collect(Collectors.toList());
        // Return a 200 OK status with the list of feedback
        return ResponseEntity.ok(responses);
    }

    // --- API Endpoint: Admin Deletes Feedback (Optional) ---
    // Handles DELETE requests to /api/feedback/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Only users with the ADMIN role can delete feedback
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) { // Get feedback ID from path variable
        // Call the service layer to delete the feedback
        feedbackService.deleteFeedback(id);
        // Return a 204 No Content status to indicate successful deletion with no response body
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/exists/{parcelId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')") // Both users and admins can check this
    public ResponseEntity<Boolean> feedbackExistsForParcel(@PathVariable Long parcelId) {
        boolean exists = feedbackService.feedbackExistsForParcel(parcelId);
        return ResponseEntity.ok(exists);
    }
}