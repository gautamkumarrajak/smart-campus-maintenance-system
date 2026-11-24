
package com.smartcampus.service;

import com.smartcampus.model.DepartmentChangeRequest;
import com.smartcampus.model.User;
import com.smartcampus.repository.DepartmentChangeRequestRepository;
import com.smartcampus.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class DepartmentChangeRequestService {

    private final DepartmentChangeRequestRepository requestRepository;
    private final UserRepository userRepository;

    private static final Set<String> DEPARTMENTS = Set.of(
            "Electrical Maintenance",
            "IT Support",
            "Network Support",
            "Plumbing Maintenance",
            "General Maintenance",
            "Technical Support",
            "Administration"
    );

    public DepartmentChangeRequestService(
            DepartmentChangeRequestRepository requestRepository,
            UserRepository userRepository) {

        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    // STAFF: Submit a department change request
    @Transactional
    public void submitRequest(
            String staffEmail,
            String requestedDepartment,
            String reason) {

        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (!"STAFF".equals(staff.getRole())) {
            throw new IllegalArgumentException(
                    "Only staff can request a department change");
        }

        if (requestedDepartment == null ||
                !DEPARTMENTS.contains(requestedDepartment)) {
            throw new IllegalArgumentException(
                    "Please select a valid department");
        }

        if (requestedDepartment.equals(staff.getDepartment())) {
            throw new IllegalArgumentException(
                    "You are already assigned to this department");
        }

        if (requestRepository.existsByStaffAndStatus(
                staff, "PENDING")) {
            throw new IllegalArgumentException(
                    "You already have a pending request");
        }

        if (reason != null && reason.length() > 500) {
            throw new IllegalArgumentException(
                    "Reason cannot exceed 500 characters");
        }

        DepartmentChangeRequest request =
                new DepartmentChangeRequest();

        request.setStaff(staff);
        request.setCurrentDepartment(staff.getDepartment());
        request.setRequestedDepartment(requestedDepartment);
        request.setReason(reason);
        request.setStatus("PENDING");
        request.setRequestedAt(LocalDateTime.now());

        requestRepository.save(request);
    }

    // STAFF: View own requests
    @Transactional(readOnly = true)
    public List<DepartmentChangeRequest> getMyRequests(
            String staffEmail) {

        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (!"STAFF".equals(staff.getRole())) {
            throw new IllegalArgumentException(
                    "Only staff can view their requests");
        }

        return requestRepository
                .findByStaffOrderByRequestedAtDesc(staff);
    }

    // ADMIN: View all requests
    @Transactional(readOnly = true)
    public List<DepartmentChangeRequest> getAllRequests() {
        return requestRepository.findAllByOrderByRequestedAtDesc();
    }

    // ADMIN: Approve or reject a request
    @Transactional
    public void reviewRequest(Long requestId, String decision) {

        if (!"APPROVED".equals(decision) &&
                !"REJECTED".equals(decision)) {
            throw new IllegalArgumentException(
                    "Decision must be APPROVED or REJECTED");
        }

        DepartmentChangeRequest request =
                requestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalArgumentException(
                    "This request has already been reviewed");
        }

        if ("APPROVED".equals(decision)) {

            User staff = request.getStaff();

            if (!"STAFF".equals(staff.getRole())) {
                throw new IllegalArgumentException(
                        "The user is no longer a staff member");
            }

            // Update staff department only after approval
            staff.setDepartment(request.getRequestedDepartment());
            userRepository.save(staff);
        }

        request.setStatus(decision);
        request.setReviewedAt(LocalDateTime.now());

        requestRepository.save(request);
    }
}
