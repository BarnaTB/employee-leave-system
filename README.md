
# Leave Management System - Project Review Guide

## Prerequisites
- Docker
- Docker Compose
- Git

## Quick Start Guide for Reviewers

### 1. Clone the Repository
```bash
git clone <repository-url>
cd leave-management-system
```

### 2. Environment Setup
Create a `.env` file with the following contents:
```
# Database Configuration
DB_USER=postgres
DB_PASSWORD=postgres

# API Configuration
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Running the Application
```bash
# Start the entire stack (this will automatically build both frontend and backend)
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080
```

### 4. Running Tests
```bash
# Run E2E tests
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

### 5. Stopping the Application
```bash
docker-compose down
```

## How the Stack Works
- **Frontend**: React application with Vite, using ShadCN UI and Tailwind CSS
- **Backend**: Spring Boot application with Gradle
- **Database**: PostgreSQL for data storage
- **Authentication**: Azure Active Directory integration through MSAL

## Review Checklist
- [ ] Application starts successfully
- [ ] Frontend is accessible
- [ ] Backend API responds
- [ ] Database initializes correctly
- [ ] User authentication works

## Test Credentials

For reviewing the application, use the following test credentials:

- **Email**: reviewer@example.com
- **Password**: TestReview2024!

### Key Test Scenarios
1. Login with the provided credentials
2. Navigate through different sections
3. Apply for leave and track its status
4. Approve/reject leave requests (if logged in as a manager)
5. Generate leave reports

## Troubleshooting
- **Common Docker Issues**: Ensure all ports (80, 8080, 5432) are available on your system
- **Backend API Not Responding**: Check the backend container logs using `docker-compose logs backend`
- **Database Connection Issues**: Verify the DB credentials in your `.env` file match those in the docker-compose.yml

## Contact
For issues during review, please contact: [Your Contact Information]
