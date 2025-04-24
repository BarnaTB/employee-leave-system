
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
# Start the entire stack
docker-compose up -d

# Verify containers are running
docker-compose ps

# Check logs if needed
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 4. Testing the Application

1. Open your browser and navigate to `http://localhost`
2. You should see the Microsoft login page
3. Test login credentials:
   - Click "Sign in with Microsoft"
   - Use your Microsoft account credentials
   - You will be redirected to the dashboard upon successful authentication

### 5. Features to Test

#### Employee Features
- View leave balance
- Apply for leave
- Check leave history
- View team calendar

#### Manager Features (if you have manager role)
- Approve/reject leave requests
- View team leave calendar
- Generate reports

#### Admin Features (if you have admin role)
- Manage departments
- Configure leave types
- Generate reports
- Manage user roles

### 6. Running E2E Tests
```bash
# Run E2E tests
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

### 7. Stopping the Application
```bash
# Stop all containers
docker-compose down

# To remove volumes as well (this will delete database data)
docker-compose down -v
```

## Troubleshooting

### Common Issues

1. **Cannot access frontend**
   - Verify that containers are running: `docker-compose ps`
   - Check frontend logs: `docker-compose logs frontend`
   - Ensure port 80 is not in use by another application

2. **API Connection Issues**
   - Verify backend is running: `docker-compose logs backend`
   - Check if VITE_API_BASE_URL is correctly set in your .env file
   - Ensure port 8080 is available

3. **Database Issues**
   - Check database logs: `docker-compose logs db`
   - Verify database credentials in .env file match docker-compose.yml

For further assistance, please contact: [Your Contact Information]

