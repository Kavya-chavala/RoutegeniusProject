// src/main/java/com/routegenius/logistics/Repository/NotificationRepository.java
package com.routegenius.logistics.Repository;

import com.routegenius.logistics.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Find all notifications for a specific user, ordered by creation date descending
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Count unread notifications for a specific user
    long countByUserIdAndIsReadFalse(Long userId);
}
