
package com.smartcampus.controller;

import com.smartcampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    private static final Set<String> DEPARTMENTS = Set.of(
        "Electrical Maintenance",
        "IT Support",
        "Network Support",
        "Plumbing Maintenance",
        "General Maintenance",
        "Technical Support",
        "Administration"
    );

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/approve-staff")
    public ResponseEntity<String> approveStaff(
            @RequestBody Map<String, String> data) {

        String email = data.get("email");
        String department = data.get("department");

        if (email == null || email.isBlank()
                || !DEPARTMENTS.contains(department)) {
            return ResponseEntity.badRequest()
                    .body("Valid email and department are required");
        }

        try {
            userService.approveStaff(email, department);

            return ResponseEntity.ok(
                    "Staff approved successfully");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {

        var users = userService.getAllUsers();

        var result = users.stream().map(user -> Map.of(
            "id", user.getId(),
            "name", user.getName() == null ? "" : user.getName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "department", user.getDepartment() == null
                    ? "Not Assigned" : user.getDepartment()
        )).toList();

        return ResponseEntity.ok(result);
    }

    @PutMapping("/update-department")
    public ResponseEntity<String> updateDepartment(
            @RequestBody Map<String, String> data) {

        String email = data.get("email");
        String department = data.get("department");

        if (email == null || email.isBlank()
                || !DEPARTMENTS.contains(department)) {
            return ResponseEntity.badRequest()
                    .body("Valid email and department are required");
        }

        try {
            userService.updateStaffDepartment(email, department);

            return ResponseEntity.ok(
                    "Staff department updated successfully");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

}
