import axios from 'axios';

// Backend URL
const API_BASE_URL = 'http://localhost:8000/api';
const BACKEND_ORIGIN = 'http://localhost:8000';

// Kunin ang token mula sessionStorage
function getAuthToken() {
  return sessionStorage.getItem('authToken');
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
    if (error.response?.status === 401) {
      // Clear expired or invalid credentials
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      
      // Force redirect to login page for a fresh unauthenticated state
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    const data = error.response?.data;
    let message = error.response?.statusText || 'Request failed';
    if (data) {
      if (typeof data === 'string') message = `Server Error: ${error.response?.status}`;
      else if (data.detail) message = data.detail;
      else if (data.message) message = data.message;
      else if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (firstKey && Array.isArray(data[firstKey])) {
          message = `${firstKey}: ${data[firstKey][0]}`;
        } else if (firstKey && typeof data[firstKey] === 'string') {
          message = data[firstKey];
        }
      }
    }
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
    return axios.post(`${API_BASE_URL}/users/bulk-import/`, formData, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    }).then(res => res.data);
  },
};

// Mag-upload ng document

export const documentsAPI = {
  getDocuments: async (params = {}) => 
    api.get('/documents/', { params }),
  
  uploadDocument: async (data) => 
    axios.post(`${API_BASE_URL}/documents/`, data, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    }).then(res => res.data),

  updateDocument: async (id, data) => {
    if (data instanceof FormData) {
      return axios.patch(`${API_BASE_URL}/documents/${id}/`, data, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      }).then(res => res.data);
    }
    return api.patch(`/documents/${id}/`, data);
  },
  
  deleteDocument: async (id) => 
    api.delete(`/documents/${id}/`),
  
  updateDocumentStatus: async (id, status, notes) => 
    api.patch(`/documents/${id}/`, { status, notes }),
  
  getReports: async () => 
    api.get('/documents/reports/'),
};

// Gumawa ng appointment
 
export const eventsAPI = {
  getAppointments: async (params = {}) => 
    api.get('/events/', { params }),
  
  createAppointment: async (appointmentData) => 
    api.post('/events/', appointmentData),
  
  updateAppointment: async (id, data) => 
    api.patch(`/events/${id}/`, data),
  
  deleteAppointment: async (id) => 
    api.delete(`/events/${id}/`),
  
  getTasks: async (params = {}) => 
    api.get('/events/tasks/', { params }),
};

// Kunin activity logs
 
export const complianceAPI = {
  getRequests: async (params = {}) => 
    api.get('/compliance/requests/', { params }),
  
  createRequest: async (requestData) => 
    api.post('/compliance/requests/', requestData),
  
  updateRequest: async (id, data) => 
    api.patch(`/compliance/requests/${id}/`, data),
  
  deleteRequest: async (id) => 
    api.delete(`/compliance/requests/${id}/`),
  
  getActivityLogs: async (params = {}) => 
    api.get('/compliance/activity-logs/', { params }),
  
  getMetrics: async () => 
    api.get('/compliance/metrics/'),
};

 // Payment
 
export const financialAPI = {
  getInvoices: async (params = {}) => 
    api.get('/financial/invoices/', { params }),
  
  getPayments: async (params = {}) => 
    api.get('/financial/payments/', { params }),
  
  createPayment: async (paymentData) => 
    api.post('/financial/payments/', paymentData),
  
  processPayment: async (paymentData) => 
    api.post('/financial/payments/', paymentData),
  
  deletePayment: async (id) => 
    api.delete(`/financial/payments/${id}/`),

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
    axios.post(`${API_BASE_URL}/maintenance/requests/`, data, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    }).then(res => res.data),
  
  updateRequest: async (id, data) => 
    api.patch(`/maintenance/requests/${id}/`, data),
    
  updateRequestWithFile: async (id, data) => 
    axios.patch(`${API_BASE_URL}/maintenance/requests/${id}/`, data, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    }).then(res => res.data),
    
  deleteRequest: async (id) => 
    api.delete(`/maintenance/requests/${id}/`),
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
  documents: documentsAPI,
  events: eventsAPI,
  compliance: complianceAPI,
  financial: financialAPI,
  commercialSpace: commercialSpaceAPI,
  maintenance: maintenanceAPI,
  notifications: notificationsAPI,
};