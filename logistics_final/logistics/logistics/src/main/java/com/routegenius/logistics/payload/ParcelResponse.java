package com.routegenius.logistics.payload;

import com.routegenius.logistics.model.ParcelStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParcelResponse {
    private Long id;
    private String trackingId;
    private String senderName;
    private String senderAddress;
    private String recipientName;
    private String recipientAddress;
    private String recipientEmail; // <--- THIS IS THE MISSING FIELD!
    private String description;
    private ParcelStatus status;
    private String currentLocation;
    private Long userId;
    private String username;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}