
# Smart Campus Complaint & Maintenance Management System

A full-stack web application designed to streamline campus maintenance operations through centralized complaint reporting, department-based assignment, complaint tracking, and role-based management.

## 1. Project Overview

The Smart Campus Complaint & Maintenance Management System provides a centralized platform for students, maintenance staff, and administrators to manage campus infrastructure complaints efficiently.

The system supports reporting of electrical, computer, network, plumbing, furniture, classroom equipment, and other maintenance-related issues.

## 2. Problem Statement

Traditional campus maintenance management often relies on manual reporting and verbal communication, which can result in:

- Delayed complaint resolution.
- Lack of complaint tracking.
- Communication gaps between students and maintenance staff.
- Difficulty identifying responsible departments.
- Limited administrative oversight.

## 3. Proposed Solution

The application provides a digital complaint management platform that automatically routes complaints to the appropriate maintenance department and allows users to track their resolution status.

It provides separate dashboards for students, staff, and administrators based on their assigned roles.

## 4. Key Features

- User registration and authentication.
- Role-based access control.
- Automatic department assignment based on complaint category.
- Complaint reporting with detailed location information.
- Complaint priority management.
- Complaint status tracking.
- Department-specific staff dashboards.
- Administrative user management.
- Staff account approval and department assignment.
- Department change request and approval system.
- Dashboard statistics.
- PostgreSQL database integration.
- BCrypt password hashing.
- Session-based authentication.

## 5. Role-Based Access

### Student

- Register and log in.
- Submit maintenance complaints.
- Specify complaint category, location, equipment, and priority.
- View complaints and track their status.
- Access complaint statistics.

### Staff

- View complaints assigned to their department.
- Update complaint resolution status.
- Submit department change requests.
- Track department change request history.

### Admin

- View and manage registered users.
- Approve users as maintenance staff.
- Assign departments to staff members.
- Update staff department assignments.
- Review and approve or reject department change requests.
- Access maintenance department dashboards.

## 6. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Java 21, Spring Boot 4.0.2 |
| Security | Spring Security, BCrypt |
| Database | PostgreSQL |
| ORM | Spring Data JPA, Hibernate |
| API | REST APIs |
| Build Tool | Maven |
| Development Environment | Visual Studio Code |
| Database Management | pgAdmin |

## 7. System Architecture

The application follows a layered architecture that separates presentation, business logic, and data access responsibilities.

```text
Presentation Layer
(HTML, CSS, JavaScript)
          |
          v
Spring Security
          |
          v
REST Controller Layer
          |
          v
Service Layer
          |
          v
Repository Layer
(Spring Data JPA)
          |
          v
PostgreSQL Database
```

### Architecture Components

- Controller Layer: Handles HTTP requests and API responses.
- Service Layer: Implements application business logic.
- Repository Layer: Handles database operations.
- Model Layer: Defines application entities.
- Security Layer: Manages authentication and role-based authorization.
- Presentation Layer: Provides user interfaces and dashboards.

## 8. Project Structure

```text
smart-campus-maintenance-system/
├── .mvn/
├── src/
│   ├── main/
│   │   ├── java/com/smartcampus/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   ├── service/
│   │   │   └── SmartCampusApplication.java
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/
│   │       │   ├── js/
│   │       │   └── pages/
│   │       └── application.properties
│   └── test/
├── .gitattributes
├── .gitignore
├── mvnw
├── mvnw.cmd
├── pom.xml
└── README.md
```

## 9. Database Design

The application uses PostgreSQL to store and manage persistent data.

### Primary Entities

| Entity | Purpose |
|---|---|
| User | Stores user information, authentication details, roles, and department assignments |
| Ticket | Stores maintenance complaints, location details, priority, department assignment, and resolution status |
| DepartmentChangeRequest | Stores staff department change requests and administrative review decisions |

## 10. Complaint Categories

| Complaint Category | Assigned Department |
|---|---|
| Electrical | Electrical Maintenance |
| Computer & IT | IT Support |
| Network & Internet | Network Support |
| Plumbing | Plumbing Maintenance |
| Furniture | General Maintenance |
| Classroom Equipment | Technical Support |
| Other | General Maintenance |

### Complaint Priority

- Low
- Medium
- High
- Critical

### Complaint Lifecycle

```text
OPEN → IN PROGRESS → RESOLVED
```

## 11. REST API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Authenticate a user |
| GET | /api/auth/me | Retrieve authenticated user details |
| POST | /api/auth/logout | Log out the current user |

### Complaint Management

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/tickets | Create a complaint |
| GET | /api/tickets | Retrieve complaints |
| GET | /api/tickets/department | Retrieve department complaints |
| PUT | /api/tickets/{id}/status | Update complaint status |

### Administration

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/admin/users | Retrieve registered users |
| PUT | /api/admin/approve-staff | Approve a staff account |
| PUT | /api/admin/update-department | Update staff department |

### Department Change Requests

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/department-requests | Submit a department change request |
| GET | /api/department-requests/my | Retrieve personal request history |
| GET | /api/department-requests | Retrieve department change requests |
| PUT | /api/department-requests/{id}/review | Approve or reject a request |

## 12. Installation and Setup

### Prerequisites

- Java Development Kit (JDK) 21 or compatible version.
- PostgreSQL.
- Git.
- Maven or the included Maven Wrapper.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd smart-campus-maintenance-system
```

### Step 2: Create the Database

Execute the following SQL command in PostgreSQL:

```sql
CREATE DATABASE helpdesk_db;
```

### Step 3: Configure Environment Variables

For Windows PowerShell:

```powershell
$env:DB_USERNAME = "your_database_username"
$env:DB_PASSWORD = "your_database_password"
```

For Linux or macOS:

```bash
export DB_USERNAME="your_database_username"
export DB_PASSWORD="your_database_password"
```

The application reads database credentials from environment variables instead of storing them directly in the source code.

The default database connection is:

```text
jdbc:postgresql://localhost:5432/helpdesk_db
```

### Step 4: Build and Test

Windows:

```powershell
.\mvnw.cmd clean test
```

Linux or macOS:

```bash
./mvnw clean test
```

### Step 5: Run the Application

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Linux or macOS:

```bash
./mvnw spring-boot:run
```

### Step 6: Access the Application

Open the following URL in a web browser:

http://localhost:8080/pages/login.html

Newly registered users are assigned the Student role by default. An initial administrator account must be provisioned separately.

## 13. Application Screenshots

Screenshots of the following interfaces will be added:

- Login and Registration
- Student Dashboard
- Complaint Reporting Form
- Staff Dashboard
- Admin Dashboard
- Department Change Request Interface

## 14. Future Enhancements

- Email and real-time complaint notifications.
- Image attachments for maintenance complaints.
- Complaint resolution analytics.
- Advanced search and filtering.
- Complaint resolution feedback and ratings.
- Improved mobile responsiveness.
- Enhanced security and automated integration testing.
- Cloud deployment.

## 15. Project Status

The core application features have been implemented and manually tested in a local development environment.

This project is intended for academic learning and portfolio demonstration. Additional security hardening and testing are required before production deployment.

## 16. Author

**Gautam Kumar Rajak**

B.Tech in Computer Science and Engineering

Developed as a full-stack Java project focused on solving real-world campus maintenance management challenges.
