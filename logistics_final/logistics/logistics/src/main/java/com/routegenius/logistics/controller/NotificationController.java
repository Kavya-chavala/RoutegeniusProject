// src/main/java/com/routegenius/logistics/controller/NotificationController.java
package com.routegenius.logistics.controller;

import com.routegenius.logistics.model.Notification;
import com.routegenius.logistics.payload.NotificationResponse;
import com.routegenius.logistics.service.NotificationService;
import com.routegenius.logistics.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Helper method to map Notification entity to NotificationResponse DTO
    private NotificationResponse mapNotificationToResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUser().getId(),
                notification.getParcel().getId(),
                notification.getParcel().getTrackingId(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    // --- Get all notifications for the currently logged-in user ---
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(Authentication authentication) {
        CustomUserDetails currentUser = (CustomUserDetails) authentication.getPrincipal();
        List<Notification> notifications = notificationService.getUserNotifications(currentUser.getId());
        List<NotificationResponse> responses = notifications.stream()
                .map(this::mapNotificationToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // --- Get the count of unread notifications for the user ---
    @GetMapping("/unread/count")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUnreadNotificationCount(Authentication authentication) {
        CustomUserDetails currentUser = (CustomUserDetails) authentication.getPrincipal();
        long count = notificationService.getUnreadNotificationCount(currentUser.getId());
        return ResponseEntity.ok(count);
    }

    // --- Mark a specific notification as read ---
    @PutMapping("/read/{notificationId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }

    // --- Admin: Delete a notification (optional) ---
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }
}