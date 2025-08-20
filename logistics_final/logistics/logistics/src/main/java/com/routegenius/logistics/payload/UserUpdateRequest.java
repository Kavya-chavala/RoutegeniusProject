package com.routegenius.logistics.payload;

import com.routegenius.logistics.model.Role;
import lombok.Data;

import jakarta.validation.constraints.Email; // <--- Changed from javax.validation.constraints
import jakarta.validation.constraints.Size;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String username;
    @Email
    private String email;
    @Size(min = 6)
    private String password; // Optional: only if user wants to change password
    private Role role; // Only for admin updates
}