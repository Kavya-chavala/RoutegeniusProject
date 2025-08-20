package com.routegenius.logistics.controller;

import com.routegenius.logistics.model.Parcel;
import com.routegenius.logistics.payload.ParcelRequest;
import com.routegenius.logistics.payload.ParcelResponse;
import com.routegenius.logistics.service.ParcelService;
import com.routegenius.logistics.security.CustomUserDetails;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List; // Still potentially needed for other methods
import java.util.stream.Collectors;

import com.routegenius.logistics.exception.ResourceNotFoundException;

// NEW IMPORTS for pagination and search
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;


@RestController
@RequestMapping("/api/parcels")
@CrossOrigin(origins = "http://localhost:3000")
public class ParcelController {

    private final ParcelService parcelService;

    public ParcelController(ParcelService parcelService) {
        this.parcelService = parcelService;
    }

    // Helper method to map Parcel entity to ParcelResponse DTO
    private ParcelResponse mapParcelToResponse(Parcel parcel) {
        return new ParcelResponse(
                parcel.getId(),
                parcel.getTrackingId(),
                parcel.getSenderName(),
                parcel.getSenderAddress(),
                parcel.getRecipientName(),
                parcel.getRecipientAddress(),
                parcel.getRecipientEmail(),
                parcel.getDescription(),
                parcel.getStatus(),
                parcel.getCurrentLocation(),
                parcel.getUser().getId(),
                parcel.getUser().getUsername(),
                parcel.getCreatedAt(),
                parcel.getUpdatedAt()
        );
    }

    // --- Admin: Create Parcel ---
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParcelResponse> createParcel(
            @Valid @RequestBody ParcelRequest parcelRequest,
            Authentication authentication) {
        try {
            Parcel parcel = new Parcel();
            parcel.setSenderName(parcelRequest.getSenderName());
            parcel.setSenderAddress(parcelRequest.getSenderAddress());
            parcel.setRecipientName(parcelRequest.getRecipientName());
            parcel.setRecipientAddress(parcelRequest.getRecipientAddress());
            parcel.setRecipientEmail(parcelRequest.getRecipientEmail());
            parcel.setDescription(parcelRequest.getDescription());
            parcel.setCurrentLocation(parcelRequest.getCurrentLocation());
            if (parcelRequest.getStatus() != null) {
                parcel.setStatus(parcelRequest.getStatus());
            }

            // Pass the userId from the parcelRequest to the service
            Parcel createdParcel = parcelService.createParcel(parcel, parcelRequest.getUserId());
            return ResponseEntity.status(HttpStatus.CREATED).body(mapParcelToResponse(createdParcel));
        } catch (Exception e) {
            throw e;
        }
    }

    // --- Admin: Update Parcel ---
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParcelResponse> updateParcel(
            @PathVariable Long id,
            @Valid @RequestBody ParcelRequest parcelRequest) {
        try {
            Parcel parcel = new Parcel();
            parcel.setSenderName(parcelRequest.getSenderName());
            parcel.setSenderAddress(parcelRequest.getSenderAddress());
            parcel.setRecipientName(parcelRequest.getRecipientName());
            parcel.setRecipientAddress(parcelRequest.getRecipientAddress());
            parcel.setRecipientEmail(parcelRequest.getRecipientEmail());
            parcel.setDescription(parcelRequest.getDescription());
            parcel.setCurrentLocation(parcelRequest.getCurrentLocation());
            if (parcelRequest.getStatus() != null) {
                parcel.setStatus(parcelRequest.getStatus());
            }

            Parcel updatedParcel = parcelService.updateParcel(id, parcel);
            return ResponseEntity.ok(mapParcelToResponse(updatedParcel));
        } catch (Exception e) {
            throw e;
        }
    }

    // --- Admin: Get All Parcels with Pagination and Search ---
    // MODIFIED: Replaces the old getAllParcels() method
    @GetMapping("/all") // Changed endpoint to /all to avoid conflict with /track/{trackingId}
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ParcelResponse>> getPaginatedParcels(
            @RequestParam(defaultValue = "0") int page, // Page number (0-indexed)
            @RequestParam(defaultValue = "10") int size, // Number of items per page
            @RequestParam(defaultValue = "id") String sortBy, // Field to sort by
            @RequestParam(defaultValue = "asc") String sortDir, // Sort direction (asc/desc)
            @RequestParam(required = false) String searchTerm) { // Optional search term

        // Create a Pageable object for pagination and sorting
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));

        // Call the service method to get paginated and searchable parcels
        Page<Parcel> parcelsPage = parcelService.getPaginatedParcels(pageable, searchTerm);

        // Convert the Page of Parcel entities to a Page of ParcelResponse DTOs
        Page<ParcelResponse> responsePage = parcelsPage.map(this::mapParcelToResponse);

        return ResponseEntity.ok(responsePage);
    }


    // --- User: Get Parcels by User ID (view their own parcels) ---
    @GetMapping("/my-parcels")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ParcelResponse>> getMyParcels(Authentication authentication) {
        CustomUserDetails currentUser = (CustomUserDetails) authentication.getPrincipal();
        Long userId = currentUser.getId();

        List<Parcel> parcels = parcelService.getParcelsByUserId(userId);
        List<ParcelResponse> responses = parcels.stream()
                .map(this::mapParcelToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // --- User/Admin: Get Parcel by Tracking ID (Requires Authentication and Ownership/Admin Role) ---
    @GetMapping("/track/{trackingId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ParcelResponse> getParcelByTrackingId(@PathVariable String trackingId, Authentication authentication) {
        CustomUserDetails currentUser = null;
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            currentUser = (CustomUserDetails) authentication.getPrincipal();
        } else {
            throw new AccessDeniedException("Authentication principal not found or invalid for this operation.");
        }

        Parcel parcel = parcelService.getParcelByTrackingId(trackingId)
                .orElseThrow(() -> new ResourceNotFoundException("Parcel not found with Tracking ID: " + trackingId));

        if (currentUser != null && (currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) ||
                (parcel.getUser() != null && parcel.getUser().getId().equals(currentUser.getId())))) {
            return ResponseEntity.ok(mapParcelToResponse(parcel));
        } else {
            throw new AccessDeniedException("You do not have permission to track this parcel.");
        }
    }

    // --- Admin: Delete Parcel ---
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteParcel(@PathVariable Long id) {
        parcelService.deleteParcel(id);
        return ResponseEntity.noContent().build();
    }
}