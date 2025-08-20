// src/main/java/com/routegenius/logistics/payload/FeedbackRequest.java
package com.routegenius.logistics.payload;

import lombok.Data;
// CORRECTED IMPORTS: Change from javax.validation.constraints to jakarta.validation.constraints
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
public class FeedbackRequest {
    @NotNull(message = "Parcel ID is required")
    private Long parcelId;

    @NotBlank(message = "Feedback text is required")
    @Size(max = 500, message = "Feedback text cannot exceed 500 characters")
    private String feedbackText;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;
}