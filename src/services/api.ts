
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
