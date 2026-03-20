import axios from 'axios';

// Backend URL
const API_BASE_URL = 'http://localhost:8000/api';
const BACKEND_ORIGIN = 'http://localhost:8000';

// Kunin ang token mula localStorage
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Axios instance setup
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mag-add ng token sa bawat request
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses at errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data;
    const message = (data && (data.detail || data.message)) || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// Login user
export const authAPI = {
  login: async (email, password) => 
    api.post('/auth/login/', { email, password }, { skipAuth: true }),
  
  logout: async () => 
    api.post('/auth/logout/', null, { skipAuth: true }),
  
  refreshToken: async (refreshToken) => 
    api.post('/auth/refresh/', { refresh: refreshToken }, { skipAuth: true }),
  
  getCurrentUser: async () => 
    api.get('/auth/me/'),
  
  updateCurrentUser: async (userData) => 
    api.patch('/auth/me/', userData),
};
 // Kunin lahat ng users
 
export const userAPI = {
  getUsers: async (params = {}) => 
    api.get('/users/', { params }),
  
  getUser: async (id) => 
    api.get(`/users/${id}/`),
  
  createUser: async (userData) => 
    api.post('/users/', userData),
  
  updateUser: async (id, userData) => 
    api.patch(`/users/${id}/`, userData),
  
  deleteUser: async (id) => 
    api.delete(`/users/${id}/`),
  
  bulkImport: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/bulk-import/', formData);
  },
};

// Mag-upload ng document

export const complianceAPI = {
  getDocuments: async (params = {}) => 
    api.get('/compliance/documents/', { params }),
  
  uploadDocument: async (data) => 
    api.post('/compliance/documents/', data),
  
  updateDocumentStatus: async (id, status, notes) => 
    api.patch(`/compliance/documents/${id}/`, { status, notes }),
  
  getReports: async () => 
    api.get('/compliance/reports/'),
};

// Gumawa ng appointment
 
export const scheduleAPI = {
  getAppointments: async (params = {}) => 
    api.get('/schedule/appointments/', { params }),
  
  createAppointment: async (appointmentData) => 
    api.post('/schedule/appointments/', appointmentData),
  
  updateAppointment: async (id, data) => 
    api.patch(`/schedule/appointments/${id}/`, data),
  
  deleteAppointment: async (id) => 
    api.delete(`/schedule/appointments/${id}/`),
  
  getTasks: async (params = {}) => 
    api.get('/schedule/tasks/', { params }),
};

// Kunin activity logs
 
export const operationsAPI = {
  getRequests: async (params = {}) => 
    api.get('/operations/requests/', { params }),
  
  createRequest: async (requestData) => 
    api.post('/operations/requests/', requestData),
  
  updateRequest: async (id, data) => 
    api.patch(`/operations/requests/${id}/`, data),
  
  getActivityLogs: async (params = {}) => 
    api.get('/operations/activity-logs/', { params }),
  
  getMetrics: async () => 
    api.get('/operations/metrics/'),
};

 // Gumawa ng invoice
 
export const financialAPI = {
  getInvoices: async (params = {}) => 
    api.get('/financial/invoices/', { params }),
  
  getPayments: async (params = {}) => 
    api.get('/financial/payments/', { params }),
  
  createPayment: async (paymentData) => 
    api.post('/financial/payments/', paymentData),
  
  processPayment: async (paymentData) => 
    api.post('/financial/payments/', paymentData),
  
  getRevenueAnalytics: async (params = {}) => 
    api.get('/financial/revenue-analytics/', { params }),
  
  getProfitLossReport: async (startDate, endDate) => 
    api.get('/financial/reports/profit-loss/', {
      params: { start_date: startDate, end_date: endDate },
    }),
};

// Mag-assign ng tenant sa unit
 
export const commercialSpaceAPI = {
  getUnits: async (params = {}) => 
    api.get('/commercial-spaces/units/', { params }),
  
  getUnit: async (id) => 
    api.get(`/commercial-spaces/units/${id}/`),
  
  createUnit: async (unitData) => 
    api.post('/commercial-spaces/units/', unitData),
  
  updateUnit: async (id, unitData) => 
    api.patch(`/commercial-spaces/units/${id}/`, unitData),
  
  deleteUnit: async (id) => 
    api.delete(`/commercial-spaces/units/${id}/`),
  
  assignTenant: async (unitId, tenantId) => 
    api.post(`/commercial-spaces/units/${unitId}/assign-tenant/`, {
      tenant_id: tenantId,
    }),
};

// Gumawa ng maintenance request
 
export const maintenanceAPI = {
  getRequests: async (params = {}) => 
    api.get('/maintenance/requests/', { params }),
  
  createRequest: async (data) => 
    api.post('/maintenance/requests/', data),
  
  updateRequest: async (id, data) => 
    api.patch(`/maintenance/requests/${id}/`, data),
};

 // Mark lahat ng notifications as read
 
export const notificationsAPI = {
  getNotifications: async (params = {}) => 
    api.get('/notifications/', { params }),
  
  markAsRead: async (id) => 
    api.patch(`/notifications/${id}/mark-read/`),
  
  markAllAsRead: async () => 
    api.post('/notifications/mark-all-read/'),
};

// Export lahat ng APIs
export default {
  auth: authAPI,
  users: userAPI,
  compliance: complianceAPI,
  schedule: scheduleAPI,
  operations: operationsAPI,
  financial: financialAPI,
  commercialSpace: commercialSpaceAPI,
  maintenance: maintenanceAPI,
  notifications: notificationsAPI,
};