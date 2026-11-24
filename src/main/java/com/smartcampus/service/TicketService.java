
package com.smartcampus.service;

import com.smartcampus.model.Ticket;
import com.smartcampus.repository.TicketRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import com.smartcampus.model.User;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    // Constructor
    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    // Save a new ticket
    public Ticket createTicket(Ticket ticket) {

        ticket.setId(null);
        ticket.setStatus("OPEN");

        String category = ticket.getCategory();

        if ("Electrical".equals(category)) {
            ticket.setAssignedDepartment("Electrical Maintenance");
        }
        else if ("Computer & IT".equals(category)) {
            ticket.setAssignedDepartment("IT Support");
        }
        else if ("Network & Internet".equals(category)) {
            ticket.setAssignedDepartment("Network Support");
        }
        else if ("Plumbing".equals(category)) {
            ticket.setAssignedDepartment("Plumbing Maintenance");
        }
        else if ("Furniture".equals(category)) {
            ticket.setAssignedDepartment("General Maintenance");
        }
        else if ("Classroom Equipment".equals(category)) {
            ticket.setAssignedDepartment("Technical Support");
        }
        else {
            ticket.setAssignedDepartment("Administration");
        }

        return ticketRepository.save(ticket);
    }

    // Get all tickets
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // Find a ticket by its ID
    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id).orElse(null);
    }

    // Update ticket status
    public Ticket updateTicketStatus(Long id, String status) {

        Ticket ticket = ticketRepository.findById(id).orElse(null);

        if (ticket == null) {
            return null;
        }

        ticket.setStatus(status);

        return ticketRepository.save(ticket);
    }

    // Delete a ticket by ID
    public boolean deleteTicket(Long id) {

        if (ticketRepository.existsById(id)) {
            ticketRepository.deleteById(id);
            return true;
        }

        return false;
    }

    
    public Ticket assignStaff(Long id, User staff) {

        Ticket ticket = ticketRepository.findById(id).orElse(null);

        if (ticket == null) {
            return null;
        }

        ticket.setAssignedStaffId(staff.getId());
        ticket.setAssignedStaff(staff.getName());

        return ticketRepository.save(ticket);
    }


    // Get complaints assigned to a specific department
    public List<Ticket> getTicketsByDepartment(String department) {

        return ticketRepository.findByAssignedDepartment(department);
    }

    public List<Ticket> getTicketsByCreator(String email) {
        return ticketRepository.findByCreatedBy(email);
    }

}
