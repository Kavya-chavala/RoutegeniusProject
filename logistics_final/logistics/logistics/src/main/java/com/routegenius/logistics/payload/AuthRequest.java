package com.routegenius.logistics.payload;



import lombok.Data;

@Data
public class AuthRequest {
    private String identifier; // Can be username or email
    private String password;
}