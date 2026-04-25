import axios from 'axios';

// access token and refresh token is in the backend Settings.py
const API_BASE_URL = 'http://localhost:8000/api';

// JWT access token — sent on every API request (7-day lifetime)
function getAuthToken() {
  return sessionStorage.getItem('authToken');
}

// JWT refresh token — used only to get a new access token (30-day lifetime)
function getRefreshToken() {
  return sessionStorage.getItem('refreshToken');
}

// Axios instance — all API calls go through this
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attaches the JWT access token to every request (skipped if { skipAuth: true })
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

// Queue system — prevents duplicate refresh calls when multiple requests fail at once
let isRefreshing = false;
let failedQueue = [];

// Resolves or rejects all queued requests after a refresh attempt
function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
}

// On 401: silently refreshes the access token using the refresh token,
// then retries the original request. Redirects to login if refresh fails.
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refresh = getRefreshToken();

      // No refresh token — redirect to login
      if (!refresh) {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        if (window.location.pathname !== '/') window.location.href = '/';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }

      // Already refreshing — queue this request and wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest).then(r => r.data ?? r);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call /auth/refresh/ directly (bypasses this interceptor)
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccessToken = data.access;
        sessionStorage.setItem('authToken', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token expired (30 days) — force re-login
        processQueue(refreshError, null);
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        if (window.location.pathname !== '/') window.location.href = '/';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      } finally {
        isRefreshing = false;
      }
    }

    // Extract a readable error message from the response
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

// Auth endpoints — { skipAuth: true } skips token attachment on these calls
export const authAPI = {
  login: async (email, password) =>          // returns { access, refresh, user }
    api.post('/auth/login/', { email, password }, { skipAuth: true }),

  logout: async (refreshToken) =>
    api.post('/auth/logout/', { refresh: refreshToken }, { skipAuth: true }),

  refreshToken: async (refreshToken) =>      // auto-called by interceptor on 401
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
};

// Payment

export const financialAPI = {
  getPayments: async (params = {}) =>
    api.get('/financial/payments/', { params }),

  createPayment: async (paymentData) =>
    api.post('/financial/payments/', paymentData),

  updatePayment: async (id, data) =>
    api.patch(`/financial/payments/${id}/`, data),

  processPayment: async (paymentData) =>
    api.post('/financial/payments/', paymentData),

  deletePayment: async (id) =>
    api.delete(`/financial/payments/${id}/`),

  getRevenueAnalytics: async (params = {}) =>
    api.get('/financial/payments/revenue-analytics/', { params }),
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

// Archives — admin-only soft-delete recovery

export const archivesAPI = {
  getArchives: async (type = '') =>
    api.get('/archives/', { params: type ? { type } : {} }),

  restore: async (id) =>
    api.post(`/archives/${id}/restore/`),

  permanentDelete: async (id) =>
    api.delete(`/archives/${id}/`),
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
  archives: archivesAPI,
};