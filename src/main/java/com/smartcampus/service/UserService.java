
package com.smartcampus.service;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void registerUser(String name, String email, String password) {

        // Check whether email already exists
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create new user
        User user = new User();

        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        // Public registration creates STUDENT accounts only
        user.setRole("STUDENT");

        // Save user in PostgreSQL
        userRepository.save(user);
    }

    public User loginUser(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return user;
    }
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    public void approveStaff(String email, String department) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (!user.getRole().equals("STUDENT")) {
            throw new IllegalArgumentException(
                    "Only student accounts can be converted to staff");
        }

        user.setRole("STAFF");
        user.setDepartment(department);

        userRepository.save(user);

    }
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void updateStaffDepartment(String email, String department) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (!"STAFF".equals(user.getRole())) {
            throw new IllegalArgumentException(
                    "Only staff departments can be updated");
        }

        user.setDepartment(department);
        userRepository.save(user);
    }


    public List<User> getStaffByDepartment(String department) {
        return userRepository.findByRoleAndDepartment(
                "STAFF", department);
    }


}
