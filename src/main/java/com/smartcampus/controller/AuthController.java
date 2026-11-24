
package com.smartcampus.controller;

import com.smartcampus.service.UserService;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // ==========================================
    // STUDENT REGISTRATION API
    // ==========================================

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody Map<String, String> data) {

        String name = data.get("name");
        String email = data.get("email");
        String password = data.get("password");

        // Validate required fields
        if (name == null || name.isBlank() ||
            email == null || email.isBlank() ||
            password == null || password.length() < 8) {

            return ResponseEntity.badRequest()
                    .body("Enter a name, email and password of at least 8 characters");
        }

        try {

            userService.registerUser(name, email, password);

            return ResponseEntity.status(201)
                    .body("Student registered successfully");

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // LOGIN API
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> data,
            HttpServletRequest request) {

        String email = data.get("email");
        String password = data.get("password");

        if (email == null || password == null) {

            return ResponseEntity.badRequest()
                    .body("Email and password are required");
        }

        try {

            var user = userService.loginUser(email, password);

            // Create authenticated user
            var authentication =
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            null,
                            java.util.List.of(
                                new org.springframework.security.core.authority
                                    .SimpleGrantedAuthority("ROLE_" + user.getRole())
                            )
                    );

            // Create Spring Security context
            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            // Create a session if one does not already exist
            request.getSession();

            // Change session ID to prevent session fixation
            request.changeSessionId();

            // Save authenticated security context
            request.getSession().setAttribute(
                    HttpSessionSecurityContextRepository
                            .SPRING_SECURITY_CONTEXT_KEY,
                    context
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "name", user.getName(),
                    "role", user.getRole()
            ));

        } catch (IllegalArgumentException e) {

            return ResponseEntity.status(401)
                    .body("Invalid email or password");
        }
    }

    // ==========================================
    // GET CURRENT AUTHENTICATED USER
    // ==========================================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            java.security.Principal principal) {

        if (principal == null) {

            return ResponseEntity.status(401)
                    .body("Not logged in");
        }

        var user = userService.findByEmail(principal.getName());

        if (user == null) {

            return ResponseEntity.status(404)
                    .body("User not found");
        }

        // HashMap allows null values
        Map<String, Object> response = new java.util.HashMap<>();

        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("department", user.getDepartment());

        return ResponseEntity.ok(response);
    }
}
