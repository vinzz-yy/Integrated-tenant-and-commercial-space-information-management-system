// DJANGO BACKEND API SERVICE
// This file contains all API integration points for the Django backend
// Base URL should be configured in environment variables

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Helper function to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// ==================== AUTHENTICATION APIs ====================
// Django Backend: Use djangorestframework-simplejwt for JWT authentication

export const authAPI = {
  // POST /api/auth/login/
  // Request: { email: string, password: string }
  // Response: { access: string, refresh: string, user: User }
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // POST /api/auth/logout/
  // Request: { refresh: string }
  // Response: { message: string }
  logout: async () => {
    return apiRequest('/auth/logout/', {
      method: 'POST',
    });
  },

  // POST /api/auth/refresh/
  // Request: { refresh: string }
  // Response: { access: string }
  refreshToken: async (refreshToken: string) => {
    return apiRequest('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },

  // GET /api/auth/me/
  // Response: User object
  getCurrentUser: async () => {
    return apiRequest('/auth/me/');
  },
};

// ==================== USER MANAGEMENT APIs ====================
// Django Backend: Create User model with roles (admin, staff, tenant)
// Use Django's built-in User model or create custom User model

export const userAPI = {
  // GET /api/users/
  // Query params: ?role=admin|staff|tenant&search=query&page=1&page_size=10
  // Response: { count: number, next: string, previous: string, results: User[] }
  getUsers: async (params?: { role?: string; search?: string; page?: number }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiRequest(`/users/?${queryString}`);
  },

  // GET /api/users/{id}/
  // Response: User object
  getUser: async (id: string) => {
    return apiRequest(`/users/${id}/`);
  },

  // POST /api/users/
  // Request: User data object
  // Response: Created User object
  createUser: async (userData: any) => {
    return apiRequest('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // PATCH /api/users/{id}/
  // Request: Partial User data object
  // Response: Updated User object
  updateUser: async (id: string, userData: any) => {
    return apiRequest(`/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  // DELETE /api/users/{id}/
  // Response: 204 No Content
  deleteUser: async (id: string) => {
    return apiRequest(`/users/${id}/`, {
      method: 'DELETE',
    });
  },

  // POST /api/users/bulk-import/
  // Request: FormData with CSV/Excel file
  // Response: { imported: number, errors: any[] }
  bulkImport: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/bulk-import/`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return response.json();
  },
};

// ==================== COMPLIANCE APIs ====================
// Django Backend: Create ComplianceDocument model with file upload

export const complianceAPI = {
  // GET /api/compliance/documents/
  // Query params: ?tenant_id=id&status=pending|approved|rejected&page=1
  // Response: Paginated list of compliance documents
  getDocuments: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/compliance/documents/?${queryString}`);
  },

  // POST /api/compliance/documents/
  // Request: FormData with file and metadata
  // Response: Created document object
  uploadDocument: async (data: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/compliance/documents/`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });
    return response.json();
  },

  // PATCH /api/compliance/documents/{id}/
  // Request: { status: string, notes: string }
  // Response: Updated document object
  updateDocumentStatus: async (id: string, status: string, notes?: string) => {
    return apiRequest(`/compliance/documents/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  // GET /api/compliance/reports/
  // Response: Compliance report data
  getReports: async () => {
    return apiRequest('/compliance/reports/');
  },
};

// ==================== SCHEDULE APIs ====================
// Django Backend: Create Appointment and Task models

export const scheduleAPI = {
  // GET /api/schedule/appointments/
  // Query params: ?date=YYYY-MM-DD&user_id=id&status=scheduled|completed|cancelled
  // Response: Paginated list of appointments
  getAppointments: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/schedule/appointments/?${queryString}`);
  },

  // POST /api/schedule/appointments/
  // Request: Appointment data
  // Response: Created appointment
  createAppointment: async (appointmentData: any) => {
    return apiRequest('/schedule/appointments/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  // PATCH /api/schedule/appointments/{id}/
  // Request: Partial appointment data
  // Response: Updated appointment
  updateAppointment: async (id: string, data: any) => {
    return apiRequest(`/schedule/appointments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // DELETE /api/schedule/appointments/{id}/
  deleteAppointment: async (id: string) => {
    return apiRequest(`/schedule/appointments/${id}/`, {
      method: 'DELETE',
    });
  },

  // GET /api/schedule/tasks/
  // Response: List of tasks
  getTasks: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/schedule/tasks/?${queryString}`);
  },
};

// ==================== OPERATIONS APIs ====================
// Django Backend: Create OperationRequest and ActivityLog models

export const operationsAPI = {
  // GET /api/operations/requests/
  // Query params: ?status=open|in_progress|closed&priority=high|medium|low
  // Response: Paginated operation requests
  getRequests: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/operations/requests/?${queryString}`);
  },

  // POST /api/operations/requests/
  // Request: Operation request data
  // Response: Created request
  createRequest: async (requestData: any) => {
    return apiRequest('/operations/requests/', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // PATCH /api/operations/requests/{id}/
  // Request: Partial request data
  // Response: Updated request
  updateRequest: async (id: string, data: any) => {
    return apiRequest(`/operations/requests/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // GET /api/operations/activity-logs/
  // Response: Activity logs
  getActivityLogs: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/operations/activity-logs/?${queryString}`);
  },

  // GET /api/operations/metrics/
  // Response: Performance metrics data
  getMetrics: async () => {
    return apiRequest('/operations/metrics/');
  },
};

// ==================== FINANCIAL APIs ====================
// Django Backend: Create Invoice, Payment, and Transaction models

export const financialAPI = {
  // GET /api/financial/invoices/
  // Query params: ?tenant_id=id&status=paid|unpaid|overdue&date_from=YYYY-MM-DD
  // Response: Paginated invoices
  getInvoices: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/financial/invoices/?${queryString}`);
  },

  // POST /api/financial/invoices/
  // Request: Invoice data
  // Response: Created invoice
  createInvoice: async (invoiceData: any) => {
    return apiRequest('/financial/invoices/', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  },

  // GET /api/financial/payments/
  // Response: Paginated payments
  getPayments: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/financial/payments/?${queryString}`);
  },

  // POST /api/financial/payments/
  // Request: Payment data
  // Response: Created payment
  processPayment: async (paymentData: any) => {
    return apiRequest('/financial/payments/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // GET /api/financial/revenue-analytics/
  // Query params: ?period=month|quarter|year&year=2026
  // Response: Revenue analytics data
  getRevenueAnalytics: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/financial/revenue-analytics/?${queryString}`);
  },

  // GET /api/financial/reports/profit-loss/
  // Query params: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
  // Response: Profit and loss report
  getProfitLossReport: async (startDate: string, endDate: string) => {
    return apiRequest(`/financial/reports/profit-loss/?start_date=${startDate}&end_date=${endDate}`);
  },
};

// ==================== COMMERCIAL SPACE APIs ====================
// Django Backend: Create CommercialUnit model

export const commercialSpaceAPI = {
  // GET /api/commercial-spaces/units/
  // Query params: ?floor=1&type=retail|food|service&status=available|occupied|reserved|maintenance
  // Response: Paginated commercial units
  getUnits: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/commercial-spaces/units/?${queryString}`);
  },

  // GET /api/commercial-spaces/units/{id}/
  // Response: Commercial unit details
  getUnit: async (id: string) => {
    return apiRequest(`/commercial-spaces/units/${id}/`);
  },

  // POST /api/commercial-spaces/units/
  // Request: Commercial unit data
  // Response: Created unit
  createUnit: async (unitData: any) => {
    return apiRequest('/commercial-spaces/units/', {
      method: 'POST',
      body: JSON.stringify(unitData),
    });
  },

  // PATCH /api/commercial-spaces/units/{id}/
  // Request: Partial unit data
  // Response: Updated unit
  updateUnit: async (id: string, unitData: any) => {
    return apiRequest(`/commercial-spaces/units/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(unitData),
    });
  },

  // DELETE /api/commercial-spaces/units/{id}/
  deleteUnit: async (id: string) => {
    return apiRequest(`/commercial-spaces/units/${id}/`, {
      method: 'DELETE',
    });
  },

  // POST /api/commercial-spaces/units/{id}/assign-tenant/
  // Request: { tenant_id: string }
  // Response: Updated unit
  assignTenant: async (unitId: string, tenantId: string) => {
    return apiRequest(`/commercial-spaces/units/${unitId}/assign-tenant/`, {
      method: 'POST',
      body: JSON.stringify({ tenant_id: tenantId }),
    });
  },
};

// ==================== MAINTENANCE APIs ====================
// Django Backend: Create MaintenanceRequest model

export const maintenanceAPI = {
  // GET /api/maintenance/requests/
  // Query params: ?tenant_id=id&status=pending|in_progress|completed&priority=high|medium|low
  // Response: Paginated maintenance requests
  getRequests: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/maintenance/requests/?${queryString}`);
  },

  // POST /api/maintenance/requests/
  // Request: Maintenance request data with optional file attachments
  // Response: Created maintenance request
  createRequest: async (data: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/maintenance/requests/`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });
    return response.json();
  },

  // PATCH /api/maintenance/requests/{id}/
  // Request: Partial maintenance request data
  // Response: Updated request
  updateRequest: async (id: string, data: any) => {
    return apiRequest(`/maintenance/requests/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// ==================== NOTIFICATIONS APIs ====================
// Django Backend: Create Notification model

export const notificationsAPI = {
  // GET /api/notifications/
  // Query params: ?read=true|false&page=1
  // Response: Paginated notifications
  getNotifications: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/notifications/?${queryString}`);
  },

  // PATCH /api/notifications/{id}/mark-read/
  // Response: Updated notification
  markAsRead: async (id: string) => {
    return apiRequest(`/notifications/${id}/mark-read/`, {
      method: 'PATCH',
    });
  },

  // POST /api/notifications/mark-all-read/
  // Response: { updated: number }
  markAllAsRead: async () => {
    return apiRequest('/notifications/mark-all-read/', {
      method: 'POST',
    });
  },
};

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
