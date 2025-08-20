package com.routegenius.logistics.controller;

import com.routegenius.logistics.exception.BadRequestException;
import com.routegenius.logistics.model.User;
import com.routegenius.logistics.payload.AuthRequest;
import com.routegenius.logistics.payload.AuthResponse;
import com.routegenius.logistics.payload.RegisterRequest;
import com.routegenius.logistics.security.CustomUserDetails;
import com.routegenius.logistics.security.jwt.JwtUtil;
import com.routegenius.logistics.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; // <--- ADD THIS IMPORT
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User newUser = new User();
            newUser.setUsername(registerRequest.getUsername());
            newUser.setEmail(registerRequest.getEmail());
            newUser.setPassword(registerRequest.getPassword());
            newUser.setFirstName(registerRequest.getFirstName());
            newUser.setLastName(registerRequest.getLastName());
            newUser.setRole(com.routegenius.logistics.model.Role.USER);

            userService.registerUser(newUser);
            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully!");
        } catch (BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getIdentifier(), authRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect username/email or password");
        }

        final CustomUserDetails userDetails = userService.findByUsernameOrEmail(authRequest.getIdentifier())
                .map(CustomUserDetails::new)
                .orElseThrow(() -> new BadCredentialsException("User not found after authentication"));

        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getEmail(), userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")));
    }
}