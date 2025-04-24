# Leave Management System - Project Review Guide

## Prerequisites
- Docker
- Docker Compose
- Git

## Quick Start Guide

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
# Start the entire stack
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080
```

### 4. Running Tests
```bash
# Run E2E tests (when implemented)
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### 5. Stopping the Application
```bash
docker-compose down
```

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

### Additional Test Scenarios
1. Login with the provided credentials
2. Navigate through different sections
3. Test leave application process
4. Verify approval workflows

## Troubleshooting
- Ensure all ports (80, 8080, 5432) are available
- Check Docker and Docker Compose versions
- Verify network connectivity

## Contact
For issues during review, please contact: [Your Contact Information]
