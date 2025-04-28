
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

### 3. Azure AD Configuration
Before running the application, ensure you've configured the following redirect URIs in the Azure AD App Registration:

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to "App Registrations"
3. Find the application with ID "76b1492c-ee98-47e4-b0ea-f4ac905161c2"
4. Go to "Authentication" tab
5. Under "Redirect URIs", add the following URLs:
   - http://localhost
   - http://localhost:80
   - http://127.0.0.1
   - http://127.0.0.1:80
   - (Add your production URL when deploying)

### 4. Running the Application
```bash
# Start the entire stack
docker-compose up -d

# Verify containers are running
docker-compose ps

# Check logs if needed
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 5. Testing the Application

1. Open your browser and navigate to `http://localhost`
2. You should see the Microsoft login page
3. Test login credentials:
   - Click "Sign in with Microsoft"
   - Use your Microsoft account credentials
   - You will be redirected to the dashboard upon successful authentication

### 6. Features to Test

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

### 7. Running E2E Tests
```bash
# Run E2E tests
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

### 8. Stopping the Application
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

4. **Microsoft Authentication Issues**
   - If you see a "redirect_uri is not valid" error, make sure you've added all the redirect URIs listed in section 3 to your Azure AD app registration
   - Check browser console logs for more detailed error information

For further assistance, please contact: [Your Contact Information]
