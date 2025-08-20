package com.routegenius.logistics.service;

import com.routegenius.logistics.exception.BadRequestException; // Import new exception
import com.routegenius.logistics.exception.ResourceNotFoundException; // Import new exception
import com.routegenius.logistics.model.User;
import com.routegenius.logistics.model.Role;
import com.routegenius.logistics.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // --- User Registration ---
    @Transactional
    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent() ||
                userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new BadRequestException("User with this email or username already exists."); // Changed to BadRequestException
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);
        return userRepository.save(user);
    }

    // --- Admin: Create User (with role selection) ---
    @Transactional
    public User createUserByAdmin(User user, Role role) {
        if (userRepository.findByEmail(user.getEmail()).isPresent() ||
                userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new BadRequestException("User with this email or username already exists."); // Changed to BadRequestException
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(role);
        return userRepository.save(user);
    }

    // --- User Login (handled by Spring Security, but this is for finding user) ---
    public Optional<User> findByUsernameOrEmail(String identifier) {
        return userRepository.findByUsernameOrEmail(identifier, identifier);
    }

    // --- Admin: Get All Users ---
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // --- Admin/User: Get User by ID ---
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // --- Admin/User: Update User ---
    @Transactional
    public User updateUser(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id)); // Changed to ResourceNotFoundException

        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setUsername(updatedUser.getUsername());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        // Role change is handled in the controller where @PreAuthorize checks are.
        // If coming from admin, it will be allowed to set the role here.
        // If coming from user, the role update will be prevented by controller logic or PreAuthorize.
        if (updatedUser.getRole() != null) { // Allow updating role if provided (admin path)
            existingUser.setRole(updatedUser.getRole());
        }

        return userRepository.save(existingUser);
    }

    // --- Admin: Delete User ---
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with ID: " + id); // Changed to ResourceNotFoundException
        }
        userRepository.deleteById(id);
    }
}