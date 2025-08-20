// src/main/java/com/routegenius/logistics/service/NotificationService.java
package com.routegenius.logistics.service;

import com.routegenius.logistics.model.Notification;
import com.routegenius.logistics.model.Parcel;
import com.routegenius.logistics.model.User;
import com.routegenius.logistics.Repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // --- Create a notification for a user and a parcel ---
    @Transactional
    public Notification createNotification(User user, Parcel parcel, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setParcel(parcel);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    // --- Get all notifications for a user, sorted by newest first ---
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // --- Get unread notification count for a user ---
    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // --- Mark a notification as read ---
    @Transactional
    public Optional<Notification> markAsRead(Long notificationId) {
        return notificationRepository.findById(notificationId).map(notification -> {
            notification.setRead(true);
            return notificationRepository.save(notification);
        });
    }

    // --- Delete a notification ---
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}