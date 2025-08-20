// src/main/java/com/routegenius/logistics/service/FeedbackService.java
package com.routegenius.logistics.service;

import com.routegenius.logistics.exception.BadRequestException;
import com.routegenius.logistics.exception.ResourceNotFoundException;
import com.routegenius.logistics.model.Feedback;
import com.routegenius.logistics.model.Parcel;
import com.routegenius.logistics.model.ParcelStatus;
import com.routegenius.logistics.model.User;
import com.routegenius.logistics.Repository.FeedbackRepository;
import com.routegenius.logistics.Repository.ParcelRepository;
import com.routegenius.logistics.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final ParcelRepository parcelRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository, ParcelRepository parcelRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.parcelRepository = parcelRepository;
    }

    // --- User: Submit Feedback ---
    @Transactional
    public Feedback submitFeedback(Long userId, Long parcelId, String feedbackText, Integer rating) {
        // 1. Validate User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // 2. Validate Parcel
        Parcel parcel = parcelRepository.findById(parcelId)
                .orElseThrow(() -> new ResourceNotFoundException("Parcel not found with ID: " + parcelId));

        // 3. Ensure parcel is DELIVERED
        if (parcel.getStatus() != ParcelStatus.DELIVERED) {
            throw new BadRequestException("Feedback can only be submitted for delivered parcels.");
        }

        // 4. Ensure user owns the parcel (security check)
        if (!parcel.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only submit feedback for parcels you own.");
        }

        // 5. Ensure no duplicate feedback for this parcel
        if (feedbackRepository.findByParcelId(parcelId).isPresent()) {
            throw new BadRequestException("Feedback for this parcel has already been submitted.");
        }

        // 6. Validate rating
        if (rating == null || rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars.");
        }

        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setParcel(parcel);
        feedback.setFeedbackText(feedbackText);
        feedback.setRating(rating);

        return feedbackRepository.save(feedback);
    }

    // --- Admin: Get All Feedback ---
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    // --- Admin: Get Feedback by ID (Optional) ---
    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    // --- Admin: Delete Feedback (Optional) ---
    @Transactional
    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new ResourceNotFoundException("Feedback not found with ID: " + id);
        }
        feedbackRepository.deleteById(id);
    }
    public boolean feedbackExistsForParcel(Long parcelId) {
        return feedbackRepository.findByParcelId(parcelId).isPresent();
    }
}