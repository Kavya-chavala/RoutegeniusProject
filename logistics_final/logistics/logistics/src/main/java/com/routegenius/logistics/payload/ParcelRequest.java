package com.routegenius.logistics.payload;

import com.routegenius.logistics.model.ParcelStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull; // Ensure this import is present
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ParcelRequest {

    @NotBlank(message = "Sender name is required")
    @Size(max = 255, message = "Sender name cannot exceed 255 characters")
    private String senderName;

    @NotBlank(message = "Sender address is required")
    private String senderAddress;

    @NotBlank(message = "Recipient name is required")
    @Size(max = 255, message = "Recipient name cannot exceed 255 characters")
    private String recipientName;

    @NotBlank(message = "Recipient address is required")
    private String recipientAddress;

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Recipient email must be a valid email address")
    private String recipientEmail;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    // Status can be set by admin on creation/update, otherwise defaults to PENDING
    private ParcelStatus status;

    @Size(max = 255, message = "Current location cannot exceed 255 characters")
    private String currentLocation;

    // --- NEW FIELD ADDED FOR PARCEL OWNERSHIP ---
    @NotNull(message = "User ID for the parcel owner is required")
    private Long userId; // The ID of the user this parcel belongs to
}