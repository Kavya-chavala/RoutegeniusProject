// src/main/java/com/routegenius/logistics/payload/FeedbackResponse.java
package com.routegenius.logistics.payload;

import lombok.Data; // Import Lombok's Data annotation
import lombok.NoArgsConstructor; // Import Lombok's NoArgsConstructor
import lombok.AllArgsConstructor; // Import Lombok's AllArgsConstructor
import java.time.LocalDateTime; // Import LocalDateTime for timestamps

@Data // Lombok annotation to automatically generate getters, setters, equals, hashCode, and toString
@NoArgsConstructor // Generates a constructor with no arguments
@AllArgsConstructor // Generates a constructor with all fields as arguments
public class FeedbackResponse {
    private Long id; // The unique ID of the feedback entry
    private String feedbackText; // The text content of the feedback
    private Integer rating; // The star rating (1-5)

    private Long userId; // The ID of the user who submitted this feedback
    private String username; // The username of the user who submitted this feedback

    private Long parcelId; // The ID of the parcel this feedback is associated with
    private String parcelTrackingId; // The tracking ID of the parcel

    private LocalDateTime submittedAt; // The timestamp when the feedback was submitted
}