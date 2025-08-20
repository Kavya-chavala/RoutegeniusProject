package com.routegenius.logistics.model;

// src/main/java/com/routegenius/logistics/model/ParcelStatus.java


public enum ParcelStatus {
    PENDING,        // Parcel created, awaiting dispatch
    DISPATCHED,     // Parcel has left the sender
    IN_TRANSIT,     // Parcel is en route to recipient
    DELIVERED,      // Parcel has been successfully delivered
    CANCELLED,      // Parcel order was cancelled
    RETURNED        // Parcel was returned to sender
}