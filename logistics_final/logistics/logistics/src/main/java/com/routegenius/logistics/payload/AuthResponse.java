package com.routegenius.logistics.payload;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String jwt;
    private Long userId;
    private String username;
    private String email;
    private String role;
}
