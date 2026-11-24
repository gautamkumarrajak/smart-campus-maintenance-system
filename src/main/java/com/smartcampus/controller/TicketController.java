
package com.smartcampus.controller;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.service.TicketService;
import com.smartcampus.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;

    // Constructor
    public TicketController(
            TicketService ticketService,
            UserService userService) {

        this.ticketService = ticketService;
        this.userService = userService;
    }

    // Create a new ticket
    @PostMapping
    public Ticket createTicket(
            @RequestBody Ticket ticket,
            Principal principal) {

        ticket.setCreatedBy(principal.getName());

        return ticketService.createTicket(ticket);
    }

    // Get tickets based on user role
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets(
            Principal principal) {

        User user = userService.findByEmail(principal.getName());

        if (user == null) {
            return ResponseEntity.status(403).build();
        }

        if ("STUDENT".equals(user.getRole())) {
            return ResponseEntity.ok(
                    ticketService.getTicketsByCreator(user.getEmail()));
        }

        if ("STAFF".equals(user.getRole())) {

            if (user.getDepartment() == null) {
                return ResponseEntity.status(403).build();
            }

            return ResponseEntity.ok(
                    ticketService.getTicketsByDepartment(
                            user.getDepartment()));
        }

        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(ticketService.getAllTickets());
        }

        return ResponseEntity.status(403).build();
    }

    // Get a ticket by ID
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(
            @PathVariable Long id,
            Principal principal) {

        User user = userService.findByEmail(principal.getName());

        if (user == null) {
            return ResponseEntity.status(403).build();
        }

        Ticket ticket = ticketService.getTicketById(id);

        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }

        if ("STUDENT".equals(user.getRole())) {

            if (!user.getEmail().equals(ticket.getCreatedBy())) {
                return ResponseEntity.status(403).build();
            }

        } else if ("STAFF".equals(user.getRole())) {

            if (user.getDepartment() == null ||
                    !user.getDepartment().equals(
                            ticket.getAssignedDepartment())) {

                return ResponseEntity.status(403).build();
            }

        } else if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(ticket);
    }

    // Update ticket status
    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal) {

        User user = userService.findByEmail(principal.getName());

        if (user == null) {
            return ResponseEntity.status(403).build();
        }

        // Only STAFF and ADMIN
        if (!"STAFF".equals(user.getRole()) &&
                !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).build();
        }

        Ticket ticket = ticketService.getTicketById(id);

        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }

        // Staff can update only their department
        if ("STAFF".equals(user.getRole())) {

            if (user.getDepartment() == null ||
                    !user.getDepartment().equals(
                            ticket.getAssignedDepartment())) {

                return ResponseEntity.status(403).build();
            }
        }

        return ResponseEntity.ok(
                ticketService.updateTicketStatus(id, status));
    }

    // Delete ticket (ADMIN only via SecurityConfig)
    @DeleteMapping("/{id}")
    public String deleteTicket(@PathVariable Long id) {

        boolean deleted = ticketService.deleteTicket(id);

        if (deleted) {
            return "Ticket deleted successfully!";
        }

        return "Ticket not found!";
    }

    // Assign complaint using unique staff ID
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignStaff(
            @PathVariable Long id,
            @RequestParam Long staffId,
            Principal principal) {

        User user = userService.findByEmail(principal.getName());

        if (user == null) {
            return ResponseEntity.status(403).build();
        }

        // Only STAFF and ADMIN can assign complaints
        if (!"STAFF".equals(user.getRole()) &&
                !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).build();
        }

        Ticket ticket = ticketService.getTicketById(id);

        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }

        // STAFF can assign only their department's complaints
        if ("STAFF".equals(user.getRole())) {

            if (user.getDepartment() == null ||
                    !user.getDepartment().equals(
                            ticket.getAssignedDepartment())) {

                return ResponseEntity.status(403).build();
            }
        }

        // Get registered STAFF of the complaint's department
        List<User> departmentStaff =
                userService.getStaffByDepartment(
                        ticket.getAssignedDepartment());

        // Find STAFF using unique ID
        User selectedStaff = departmentStaff.stream()
                .filter(staff -> staff.getId().equals(staffId))
                .findFirst()
                .orElse(null);

        if (selectedStaff == null) {
            return ResponseEntity.badRequest()
                    .body("Invalid staff ID or department");
        }

        // Save staff ID and name
        return ResponseEntity.ok(
                ticketService.assignStaff(id, selectedStaff));
    }

    // Get complaints by department
    @GetMapping("/department")
    public ResponseEntity<List<Ticket>> getTicketsByDepartment(
            @RequestParam String name,
            Principal principal) {

        User user = userService.findByEmail(principal.getName());

        if (user == null) {
            return ResponseEntity.status(403).build();
        }

        // Admin can access any department
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(
                    ticketService.getTicketsByDepartment(name));
        }

        // Staff can access only their assigned department
        if ("STAFF".equals(user.getRole())) {

            String department = user.getDepartment();

            if (department == null ||
                    !department.equals(name)) {
                return ResponseEntity.status(403).build();
            }

            return ResponseEntity.ok(
                    ticketService.getTicketsByDepartment(department));
        }

        return ResponseEntity.status(403).build();
    }

    @GetMapping("/staff")
    public ResponseEntity<?> getAvailableStaff(
            @RequestParam String department,
            Principal principal) {

        User user = userService.findByEmail(principal.getName());

        if (user == null) {
            return ResponseEntity.status(403).build();
        }

        // Only STAFF and ADMIN can view available staff
        if (!"STAFF".equals(user.getRole()) &&
                !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).build();
        }

        // STAFF can view only their own department
        if ("STAFF".equals(user.getRole())) {
            if (user.getDepartment() == null ||
                    !user.getDepartment().equals(department)) {
                return ResponseEntity.status(403).build();
            }
        }

        List<User> staffList =
                userService.getStaffByDepartment(department);

        // Return only the fields needed by the dropdown
        List<java.util.Map<String, Object>> result =
                staffList.stream()
                        .map(staff -> {
                            java.util.Map<String, Object> item =
                                    new java.util.HashMap<>();

                            item.put("id", staff.getId());
                            item.put("name", staff.getName());

                            return item;
                        })
                        .toList();

        return ResponseEntity.ok(result);
    }

}
