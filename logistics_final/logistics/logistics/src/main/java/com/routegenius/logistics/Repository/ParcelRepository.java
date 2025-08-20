// src/main/java/com/routegenius/logistics/Repository/ParcelRepository.java
package com.routegenius.logistics.Repository;

import com.routegenius.logistics.model.Parcel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // NEW Import
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParcelRepository extends JpaRepository<Parcel, Long>, JpaSpecificationExecutor<Parcel> { // NEW: Extend JpaSpecificationExecutor
    Optional<Parcel> findByTrackingId(String trackingId);

    List<Parcel> findByUserId(Long userId);
}