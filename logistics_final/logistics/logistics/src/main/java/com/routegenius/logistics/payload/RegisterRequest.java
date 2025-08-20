package com.routegenius.logistics.payload;

import com.routegenius.logistics.model.Role; // Import Role enum
import lombok.Data;

import jakarta.validation.constraints.Email; // <--- Changed from javax.validation.constraints
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class RegisterRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank
    @Email
    private String email;
    @NotBlank
    @Size(min = 4, max = 20)
    private String username;
    @NotBlank
    @Size(min = 6)
    private String password;

    // Added for admin creation
    private Role role; // Optional: Admin can set this. Defaulted to USER in service if not provided.
}