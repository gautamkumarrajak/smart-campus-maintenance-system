
package com.smartcampus.controller;

import com.smartcampus.model.DepartmentChangeRequest;
import com.smartcampus.service.DepartmentChangeRequestService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/department-requests")
public class DepartmentChangeRequestController {

    private final DepartmentChangeRequestService service;

    public DepartmentChangeRequestController(
            DepartmentChangeRequestService service) {
        this.service = service;
    }

    // Request data sent by STAFF
    public record RequestData(
            String requestedDepartment,
            String reason
    ) {}

    // Safe response without exposing User passwords
    public record RequestResponse(
            Long id,
            String staffName,
            String staffEmail,
            String currentDepartment,
            String requestedDepartment,
            String reason,
            String status,
            LocalDateTime requestedAt,
            LocalDateTime reviewedAt
    ) {}

    private RequestResponse toResponse(
            DepartmentChangeRequest request) {

        return new RequestResponse(
                request.getId(),
                request.getStaff().getName(),
                request.getStaff().getEmail(),
                request.getCurrentDepartment(),
                request.getRequestedDepartment(),
                request.getReason(),
                request.getStatus(),
                request.getRequestedAt(),
                request.getReviewedAt()
        );
    }

    // STAFF: Submit a department change request
    @PreAuthorize("hasRole('STAFF')")
    @PostMapping
    public ResponseEntity<String> submitRequest(
            @RequestBody RequestData data,
            Principal principal) {

        try {
            service.submitRequest(
                    principal.getName(),
                    data.requestedDepartment(),
                    data.reason()
            );

            return ResponseEntity.ok(
                    "Department change request submitted successfully"
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // STAFF: View own department change requests
    @PreAuthorize("hasRole('STAFF')")
    @GetMapping("/my")
    public ResponseEntity<List<RequestResponse>> getMyRequests(
            Principal principal) {

        List<RequestResponse> requests =
                service.getMyRequests(principal.getName())
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(requests);
    }

    // ADMIN: View all department change requests
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<RequestResponse>> getAllRequests() {

        List<RequestResponse> requests =
                service.getAllRequests()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(requests);
    }

    // ADMIN: Approve or reject a request
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/review")
    public ResponseEntity<String> reviewRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> data) {

        try {
            String decision = data.get("decision");

            service.reviewRequest(id, decision);

            return ResponseEntity.ok(
                    "Department change request " +
                    decision.toLowerCase() + " successfully"
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}
