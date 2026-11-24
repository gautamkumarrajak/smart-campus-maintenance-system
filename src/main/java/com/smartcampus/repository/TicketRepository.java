
package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByAssignedDepartment(String assignedDepartment);
    List<Ticket> findByCreatedBy(String createdBy);
}
