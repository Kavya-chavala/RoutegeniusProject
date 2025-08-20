// src/main/java/com/routegenius/logistics/payload/NotificationResponse.java
package com.routegenius.logistics.payload;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long userId;
    private Long parcelId;
    private String parcelTrackingId;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
}