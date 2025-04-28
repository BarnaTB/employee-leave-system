import axios from 'axios';
import { config } from '@/config';

const api = axios.create({
  baseURL: config.api.baseUrl,
  // Enable credentials for CORS requests
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Add a request interceptor to inject the JWT token and debug information
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      withCredentials: config.withCredentials,
      baseURL: config.baseURL,
      environment: window.location.hostname.includes('lovable') ? 'preview' : 'local'
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.response) {
      // Server returned an error response (4xx, 5xx)
      console.error('Server Error:', error.response.status, error.response.data);
      console.error('Request that caused error:', {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        baseURL: error.config.baseURL,
        environment: config.environment
      });
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error('Network Error:', error.request);
      console.error('Request details:', {
        url: error.config.url,
        method: error.config.method,
        baseURL: error.config.baseURL,
        environment: config.environment
      });
    } else {
      // Error in setting up the request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const leaveApi = {
  // Employee endpoints
  getLeaveBalance: (employeeId: number) => 
    api.get(`/employee/leave-balance?employeeId=${employeeId}`),
  
  applyForLeave: (leaveData: {
    employeeId: number;
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    halfDay: boolean;
    reason: string;
    document?: string;
  }) => api.post('/employee/apply-leave', leaveData),
  
  getLeaveHistory: (employeeId: number) => 
    api.get(`/employee/leave-history?employeeId=${employeeId}`),
  
  // Manager endpoints
  approveLeaveByManager: (leaveId: number, data: { approverComments: string }) => 
    api.post(`/leave-application/${leaveId}/approve/manager`, data),
  
  // Admin endpoints
  approveLeaveByAdmin: (leaveId: number, data: { approverComments: string }) => 
    api.post(`/leave-application/${leaveId}/approve/admin`, data),
  
  rejectLeave: (leaveId: number, data: { approverComments: string }) => 
    api.post(`/leave-application/${leaveId}/reject`, data),
  
  processYearEndCarryover: () => 
    api.post('/leave-balance/process-carryover'),
  
  // Leave Types CRUD
  getAllLeaveTypes: () => 
    api.get('/admin/leave-types'),
  
  createLeaveType: (data: { name: string; description: string }) => 
    api.post('/admin/leave-types', data),
  
  updateLeaveType: (id: number, data: { name: string; description: string }) => 
    api.put(`/admin/leave-types/${id}`, data),
  
  deleteLeaveType: (id: number) => 
    api.delete(`/admin/leave-types/${id}`),
};

// New Department API endpoints
export const departmentApi = {
  // Department management
  createDepartment: (data: { name: string }) => 
    api.post('/departments', data),
  
  assignEmployeeToDepartment: (data: { employeeId: number; departmentId: number }) => 
    api.post('/departments/assign-employee', data),
  
  getEmployeesOnLeaveByDepartment: (departmentId: number) => 
    api.get(`/departments/${departmentId}/employees-on-leave`),
  
  updateEmployeeRole: (employeeId: number, newRole: string) => 
    api.patch(`/departments/employees/${employeeId}/role?newRole=${newRole}`),
    
  // Department list
  getAllDepartments: () => 
    api.get('/departments'),
    
  getDepartmentById: (id: number) => 
    api.get(`/departments/${id}`),
};

// Report generation API endpoints
export const reportApi = {
  generateEmployeeLeaveReport: (employeeId: number) => 
    api.get(`/admin/employee/${employeeId}/report`, { responseType: 'blob' }),
  
  generateDepartmentLeaveReport: (departmentId: number) => 
    api.get(`/admin/department/${departmentId}/report`, { responseType: 'blob' }),
  
  generateLeaveTypeReport: (leaveTypeId: number) => 
    api.get(`/admin/leave-type/${leaveTypeId}/report`, { responseType: 'blob' }),
};
