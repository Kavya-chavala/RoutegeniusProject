// src/main/java/com/routegenius/logistics/Repository/FeedbackRepository.java
package com.routegenius.logistics.Repository;

import com.routegenius.logistics.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // For search/pagination if needed later
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long>, JpaSpecificationExecutor<Feedback> {
    // Custom query to find feedback by parcel ID, useful to check if feedback already exists for a parcel
    Optional<Feedback> findByParcelId(Long parcelId);
}