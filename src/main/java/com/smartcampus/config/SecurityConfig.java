
package com.smartcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            // Temporary: CSRF protection will be added later
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                // Public login and registration
                .requestMatchers(
                    "/pages/login.html",
                    "/css/login.css",
                    "/js/login.js",
                    "/api/auth/register",
                    "/api/auth/login"
                ).permitAll()

                // Only STUDENT can create complaints
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/tickets"
                ).hasRole("STUDENT")

                // STAFF and ADMIN dashboard access
                .requestMatchers(
                    "/pages/staff.html",
                    "/css/staff.css",
                    "/js/staff.js"
                ).hasAnyRole("STAFF", "ADMIN")

                // Department-wise complaint access
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/tickets/department"
                ).hasAnyRole("STAFF", "ADMIN")

                // Available staff list
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/tickets/staff"
                ).hasAnyRole("STAFF", "ADMIN")

                // STAFF and ADMIN can update and assign complaints
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/tickets/*/status",
                    "/api/tickets/*/assign"
                ).hasAnyRole("STAFF", "ADMIN")

                // Only ADMIN can delete complaints
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/tickets/**"
                ).hasRole("ADMIN")

                // ADMIN dashboard files
                .requestMatchers(
                    "/pages/admin.html",
                    "/css/admin.css",
                    "/js/admin.js"
                ).hasRole("ADMIN")

                // ADMIN management APIs
                .requestMatchers(
                    "/api/admin/**"
                ).hasRole("ADMIN")

                // ==========================================
                // DEPARTMENT CHANGE REQUEST APIs
                // ==========================================

                // STAFF: Submit a department change request
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/department-requests"
                ).hasRole("STAFF")

                // STAFF: View own requests
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/department-requests/my"
                ).hasRole("STAFF")

                // ADMIN: View all department requests
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/department-requests"
                ).hasRole("ADMIN")

                // ADMIN: Approve or reject requests
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/department-requests/*/review"
                ).hasRole("ADMIN")

                // Deny other unspecified department request operations
                .requestMatchers(
                    "/api/department-requests",
                    "/api/department-requests/**"
                ).denyAll()

                // All other requests require authentication
                .anyRequest().authenticated()
            )

            // Logout configuration
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessUrl("/pages/login.html")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
            );

        return http.build();
    }
}
