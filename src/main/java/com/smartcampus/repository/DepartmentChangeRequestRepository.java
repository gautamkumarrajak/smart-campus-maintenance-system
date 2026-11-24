
package com.smartcampus.repository;

import com.smartcampus.model.DepartmentChangeRequest;
import com.smartcampus.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentChangeRequestRepository
        extends JpaRepository<DepartmentChangeRequest, Long> {

    // Find all requests submitted by a staff member
    List<DepartmentChangeRequest> findByStaffOrderByRequestedAtDesc(
            User staff
    );

    // Find requests by status (PENDING, APPROVED, REJECTED)
    List<DepartmentChangeRequest> findByStatusOrderByRequestedAtDesc(
            String status
    );

    // Check if a staff member already has a pending request
    boolean existsByStaffAndStatus(
            User staff,
            String status
    );

    // Get all requests, newest first
    List<DepartmentChangeRequest> findAllByOrderByRequestedAtDesc();
}
