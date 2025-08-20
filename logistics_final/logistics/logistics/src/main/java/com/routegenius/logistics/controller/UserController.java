package com.routegenius.logistics.controller;

import com.routegenius.logistics.exception.BadRequestException; // Import new exception
import com.routegenius.logistics.exception.ResourceNotFoundException; // Import new exception
import com.routegenius.logistics.model.User;
import com.routegenius.logistics.payload.RegisterRequest;
import com.routegenius.logistics.payload.UserUpdateRequest;
import com.routegenius.logistics.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException; // Import for AccessDeniedException
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    // Explicitly return ResponseEntity<User> for successful creation
    public ResponseEntity<User> createUserByAdmin(@Valid @RequestBody RegisterRequest registerRequest) {
        // No try-catch here; exceptions are thrown and will be caught globally
        // This makes the success path return consistent.
        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(registerRequest.getPassword()); // Will be hashed in service
        newUser.setFirstName(registerRequest.getFirstName());
        newUser.setLastName(registerRequest.getLastName());
        // Admin can specify role, default to USER if not provided
        newUser.setRole(registerRequest.getRole() != null ? registerRequest.getRole() : com.routegenius.logistics.model.Role.USER);

        User createdUser = userService.createUserByAdmin(newUser, newUser.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser); // Return the created User object
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (#id == authentication.principal.id)")
    // Explicitly return ResponseEntity<User> for successful update
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest userUpdateRequest) {
        // No try-catch here; exceptions are thrown and will be caught globally
        User existingUser = userService.getUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        // Update fields that can be changed
        if (userUpdateRequest.getFirstName() != null) existingUser.setFirstName(userUpdateRequest.getFirstName());
        if (userUpdateRequest.getLastName() != null) existingUser.setLastName(userUpdateRequest.getLastName());
        if (userUpdateRequest.getUsername() != null) existingUser.setUsername(userUpdateRequest.getUsername());
        if (userUpdateRequest.getEmail() != null) existingUser.setEmail(userUpdateRequest.getEmail());

        // Password update logic
        if (userUpdateRequest.getPassword() != null && !userUpdateRequest.getPassword().isEmpty()) {
            existingUser.setPassword(userUpdateRequest.getPassword()); // Service will hash this
        }

        // Role change is ONLY allowed for ADMIN.
        // This check is in addition to @PreAuthorize for specific cases.
        if (userUpdateRequest.getRole() != null && !userUpdateRequest.getRole().equals(existingUser.getRole())) {
            if (org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                existingUser.setRole(userUpdateRequest.getRole());
            } else {
                throw new AccessDeniedException("Only admin can change user roles."); // Throw A.D.E for forbidden
            }
        }

        User updatedUser = userService.updateUser(id, existingUser);
        return ResponseEntity.ok(updatedUser); // Return the updated User object
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    // Explicitly return ResponseEntity<Void> for successful deletion (204 No Content)
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    @GetMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.id or hasRole('ADMIN')")
    // Keep as ResponseEntity<User> since success returns User and errors throw exceptions
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        // No try-catch here; exceptions are thrown and will be caught globally
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id)); // Throw exception
    }
}