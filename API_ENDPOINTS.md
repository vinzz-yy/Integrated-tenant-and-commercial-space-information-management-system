# API Endpoints Reference
## LA Union Skymall Property Management System

This document provides a quick reference for all Django backend API endpoints used by the React frontend.

---

## Base URL

```
http://localhost:8000/api
```

For production, update the `VITE_API_BASE_URL` in your `.env` file.

---

## Authentication

All endpoints except login require JWT authentication.

**Authorization Header:**
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### Login
```http
POST /api/auth/login/
```

**Request Body:**
```json
{
  "email": "admin@skymall.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@skymall.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "avatar": "http://..."
  }
}
```

---

### Refresh Token
```http
POST /api/auth/refresh/
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### Logout
```http
POST /api/auth/logout/
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

---

### Get Current User
```http
GET /api/auth/me/
```

**Response:**
```json
{
  "id": 1,
  "email": "admin@skymall.com",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin",
  "phone": "+1 (555) 100-1000",
  "avatar": "http://...",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

## 👥 User Management Endpoints

### List Users
```http
GET /api/users/
```

**Query Parameters:**
- `role` - Filter by role (admin, staff, tenant)
- `search` - Search by name or email
- `page` - Page number for pagination
- `page_size` - Items per page (default: 10)

**Example:**
```
GET /api/users/?role=tenant&search=john&page=1
```

**Response:**
```json
{
  "count": 28,
  "next": "http://localhost:8000/api/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 3,
      "email": "john.tenant@email.com",
      "firstName": "John",
      "lastName": "Tenant",
      "role": "tenant",
      "phone": "+1 (555) 123-4567",
      "unitNumber": "A-105",
      "avatar": "http://...",
      "createdAt": "2025-01-20T08:00:00Z"
    }
  ]
}
```

---

### Get User Detail
```http
GET /api/users/{id}/
```

**Response:** Same as user object above

---

### Create User
```http
POST /api/users/
```

**Request Body:**
```json
{
  "email": "newuser@email.com",
  "firstName": "New",
  "lastName": "User",
  "password": "secure_password",
  "role": "tenant",
  "phone": "+1 (555) 999-9999",
  "unitNumber": "B-205"
}
```

**Response:** Created user object

---

### Update User
```http
PATCH /api/users/{id}/
```

**Request Body:** (Partial update)
```json
{
  "phone": "+1 (555) 888-8888",
  "firstName": "Updated"
}
```

**Response:** Updated user object

---

### Delete User
```http
DELETE /api/users/{id}/
```

**Response:** `204 No Content`

---

### Bulk Import Users
```http
POST /api/users/bulk-import/
```

**Request:** `multipart/form-data`
```
file: users.csv
```

**Response:**
```json
{
  "imported": 15,
  "errors": []
}
```

---

## 📄 Compliance Management Endpoints

### List Compliance Documents
```http
GET /api/compliance/documents/
```

**Query Parameters:**
- `tenant_id` - Filter by tenant
- `status` - Filter by status (pending, approved, rejected, expiring_soon)
- `page` - Page number

**Response:**
```json
{
  "count": 12,
  "results": [
    {
      "id": 1,
      "tenantId": 3,
      "tenantName": "John Tenant",
      "documentType": "business_license",
      "fileName": "business-license-2026.pdf",
      "uploadDate": "2026-02-15",
      "expiryDate": "2027-02-15",
      "status": "approved",
      "notes": "All documents verified"
    }
  ]
}
```

---

### Upload Compliance Document
```http
POST /api/compliance/documents/
```

**Request:** `multipart/form-data`
```
file: document.pdf
document_type: business_license
tenant_id: 3
expiry_date: 2027-02-15
```

**Response:** Created document object

---

### Update Document Status
```http
PATCH /api/compliance/documents/{id}/
```

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Document verified and approved"
}
```

**Response:** Updated document object

---

### Delete Document
```http
DELETE /api/compliance/documents/{id}/
```

**Response:** `204 No Content`

---

## 📅 Schedule Management Endpoints

### List Appointments
```http
GET /api/schedule/appointments/
```

**Query Parameters:**
- `date` - Filter by date (YYYY-MM-DD)
- `user_id` - Filter by user
- `status` - Filter by status (scheduled, completed, cancelled)

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "title": "Unit Inspection - A-105",
      "date": "2026-03-05",
      "time": "10:00:00",
      "duration": "1 hour",
      "type": "inspection",
      "status": "scheduled",
      "location": "Unit A-105",
      "attendees": [3, 5],
      "createdBy": 1
    }
  ]
}
```

---

### Create Appointment
```http
POST /api/schedule/appointments/
```

**Request Body:**
```json
{
  "title": "Lease Renewal Meeting",
  "date": "2026-03-10",
  "time": "14:00:00",
  "duration": "30 minutes",
  "type": "meeting",
  "location": "Office",
  "attendees": [3, 1]
}
```

**Response:** Created appointment object

---

### Update Appointment
```http
PATCH /api/schedule/appointments/{id}/
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:** Updated appointment object

---

### Delete Appointment
```http
DELETE /api/schedule/appointments/{id}/
```

**Response:** `204 No Content`

---

## 🔧 Operations Management Endpoints

### List Operation Requests
```http
GET /api/operations/requests/
```

**Query Parameters:**
- `status` - Filter by status (open, in_progress, closed)
- `priority` - Filter by priority (high, medium, low)
- `assigned_to` - Filter by assigned staff

**Response:**
```json
{
  "count": 8,
  "results": [
    {
      "id": 1,
      "title": "HVAC System Malfunction - Floor 3",
      "description": "Air conditioning not working properly",
      "type": "technical",
      "priority": "high",
      "status": "in_progress",
      "createdBy": 2,
      "assignedTo": 5,
      "createdAt": "2026-03-01T09:30:00Z"
    }
  ]
}
```

---

### Create Operation Request
```http
POST /api/operations/requests/
```

**Request Body:**
```json
{
  "title": "Access Control Update",
  "description": "Update access codes for new tenants",
  "type": "security",
  "priority": "medium"
}
```

**Response:** Created request object

---

### Update Operation Request
```http
PATCH /api/operations/requests/{id}/
```

**Request Body:**
```json
{
  "status": "closed",
  "assignedTo": 5
}
```

**Response:** Updated request object

---

## 💰 Financial Management Endpoints

### List Invoices
```http
GET /api/financial/invoices/
```

**Query Parameters:**
- `tenant_id` - Filter by tenant
- `status` - Filter by status (paid, unpaid, overdue)
- `date_from` - Start date (YYYY-MM-DD)
- `date_to` - End date (YYYY-MM-DD)

**Response:**
```json
{
  "count": 15,
  "results": [
    {
      "id": "INV-001",
      "tenantId": 3,
      "tenantName": "John Tenant",
      "unitNumber": "A-105",
      "amount": 2500.00,
      "description": "Monthly Rent - March 2026",
      "issueDate": "2026-03-01",
      "dueDate": "2026-03-15",
      "status": "paid"
    }
  ]
}
```

---

### Create Invoice
```http
POST /api/financial/invoices/
```

**Request Body:**
```json
{
  "tenantId": 3,
  "amount": 2500.00,
  "description": "Monthly Rent - April 2026",
  "issueDate": "2026-04-01",
  "dueDate": "2026-04-15"
}
```

**Response:** Created invoice object

---

### List Payments
```http
GET /api/financial/payments/
```

**Query Parameters:**
- `tenant_id` - Filter by tenant
- `date_from` - Start date
- `date_to` - End date

**Response:**
```json
{
  "count": 10,
  "results": [
    {
      "id": "PAY-001",
      "invoiceId": "INV-001",
      "amount": 2500.00,
      "paymentMethod": "credit_card",
      "paymentDate": "2026-03-10",
      "transactionId": "TXN-20260310-001",
      "status": "completed"
    }
  ]
}
```

---

### Process Payment
```http
POST /api/financial/payments/
```

**Request Body:**
```json
{
  "invoiceId": "INV-002",
  "amount": 3200.00,
  "paymentMethod": "bank_transfer",
  "transactionId": "TXN-20260315-002"
}
```

**Response:** Created payment object

---

### Get Revenue Analytics
```http
GET /api/financial/revenue-analytics/
```

**Query Parameters:**
- `period` - Time period (month, quarter, year)
- `year` - Year (default: current year)

**Response:**
```json
{
  "data": [
    {
      "month": "January",
      "revenue": 125000,
      "expenses": 45000,
      "profit": 80000
    },
    {
      "month": "February",
      "revenue": 132000,
      "expenses": 48000,
      "profit": 84000
    }
  ],
  "total": {
    "revenue": 820000,
    "expenses": 310000,
    "profit": 510000
  }
}
```

---

### Get Profit & Loss Report
```http
GET /api/financial/reports/profit-loss/
```

**Query Parameters:**
- `start_date` - Start date (YYYY-MM-DD)
- `end_date` - End date (YYYY-MM-DD)

**Response:**
```json
{
  "period": {
    "startDate": "2026-01-01",
    "endDate": "2026-03-31"
  },
  "revenue": {
    "rental": 385000,
    "services": 45000,
    "total": 430000
  },
  "expenses": {
    "maintenance": 60000,
    "utilities": 35000,
    "staff": 85000,
    "total": 180000
  },
  "netProfit": 250000,
  "profitMargin": 58.14
}
```

---

## 🏢 Commercial Space Management Endpoints

### List Commercial Units
```http
GET /api/commercial-spaces/units/
```

**Query Parameters:**
- `floor` - Filter by floor number
- `type` - Filter by type (retail, food, service, office)
- `status` - Filter by status (available, occupied, reserved, maintenance)

**Response:**
```json
{
  "count": 33,
  "results": [
    {
      "id": 1,
      "unitNumber": "A-105",
      "floor": 1,
      "size": 150.00,
      "type": "retail",
      "rentalRate": 2500.00,
      "status": "occupied",
      "tenantId": 3,
      "tenantName": "John Tenant",
      "leaseStartDate": "2025-06-01",
      "leaseEndDate": "2027-05-31"
    }
  ]
}
```

---

### Get Unit Detail
```http
GET /api/commercial-spaces/units/{id}/
```

**Response:** Unit object

---

### Create Commercial Unit
```http
POST /api/commercial-spaces/units/
```

**Request Body:**
```json
{
  "unitNumber": "C-305",
  "floor": 3,
  "size": 180.00,
  "type": "retail",
  "rentalRate": 2800.00,
  "status": "available"
}
```

**Response:** Created unit object

---

### Update Commercial Unit
```http
PATCH /api/commercial-spaces/units/{id}/
```

**Request Body:**
```json
{
  "status": "occupied",
  "tenantId": 4,
  "leaseStartDate": "2026-04-01",
  "leaseEndDate": "2028-03-31"
}
```

**Response:** Updated unit object

---

### Delete Commercial Unit
```http
DELETE /api/commercial-spaces/units/{id}/
```

**Response:** `204 No Content`

---

### Assign Tenant to Unit
```http
POST /api/commercial-spaces/units/{id}/assign-tenant/
```

**Request Body:**
```json
{
  "tenantId": 4,
  "leaseStartDate": "2026-04-01",
  "leaseEndDate": "2028-03-31"
}
```

**Response:** Updated unit object

---

## 🔧 Maintenance Request Endpoints

### List Maintenance Requests
```http
GET /api/maintenance/requests/
```

**Query Parameters:**
- `tenant_id` - Filter by tenant
- `status` - Filter by status (pending, in_progress, completed, cancelled)
- `priority` - Filter by priority (high, medium, low)

**Response:**
```json
{
  "count": 6,
  "results": [
    {
      "id": 1,
      "tenantId": 3,
      "tenantName": "John Tenant",
      "unitNumber": "A-105",
      "title": "Leaking Faucet",
      "description": "The bathroom faucet is leaking continuously",
      "priority": "medium",
      "status": "in_progress",
      "assignedTo": 5,
      "attachment": "http://...",
      "createdAt": "2026-02-28T14:30:00Z",
      "completedAt": null
    }
  ]
}
```

---

### Create Maintenance Request
```http
POST /api/maintenance/requests/
```

**Request:** `multipart/form-data`
```
tenant_id: 3
unit_number: A-105
title: Air Conditioning Not Working
description: The AC unit is not cooling properly
priority: high
attachment: photo.jpg (optional)
```

**Response:** Created request object

---

### Update Maintenance Request
```http
PATCH /api/maintenance/requests/{id}/
```

**Request Body:**
```json
{
  "status": "completed",
  "assignedTo": 5,
  "completedAt": "2026-03-02T16:00:00Z"
}
```

**Response:** Updated request object

---

## 🔔 Notification Endpoints

### List Notifications
```http
GET /api/notifications/
```

**Query Parameters:**
- `read` - Filter by read status (true, false)
- `page` - Page number

**Response:**
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "title": "New Payment Received",
      "message": "Payment of $2,500 received from John Tenant",
      "type": "success",
      "read": false,
      "createdAt": "2026-03-02T10:30:00Z"
    }
  ]
}
```

---

### Mark Notification as Read
```http
PATCH /api/notifications/{id}/mark-read/
```

**Response:**
```json
{
  "id": 1,
  "read": true
}
```

---

### Mark All Notifications as Read
```http
POST /api/notifications/mark-all-read/
```

**Response:**
```json
{
  "updated": 10
}
```

---

## 📊 Dashboard Endpoints

### Get Admin Dashboard Stats
```http
GET /api/dashboard/stats/
```

**Response:**
```json
{
  "totalUsers": 45,
  "totalTenants": 28,
  "totalStaff": 12,
  "totalRevenue": 128000,
  "occupancyRate": 85,
  "pendingCompliance": 5,
  "scheduledAppointments": 12
}
```

---

### Get Staff Dashboard Stats
```http
GET /api/dashboard/staff-stats/
```

**Response:**
```json
{
  "myTasks": 12,
  "todayAppointments": 3,
  "pendingReviews": 5,
  "activeRequests": 8
}
```

---

### Get Tenant Dashboard Stats
```http
GET /api/dashboard/tenant-stats/
```

**Query Parameters:**
- `tenant_id` - Tenant ID

**Response:**
```json
{
  "unitNumber": "A-105",
  "pendingPayments": 3200.00,
  "maintenanceRequests": 2,
  "documents": 3
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid data provided",
  "details": {
    "email": ["This field is required."]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred. Please try again later."
}
```

---

## Rate Limiting

API requests are limited to:
- **100 requests per minute** for authenticated users
- **20 requests per minute** for unauthenticated users

---

## Notes

- All dates are in ISO 8601 format (YYYY-MM-DD)
- All timestamps are in ISO 8601 format with timezone (YYYY-MM-DDTHH:MM:SSZ)
- All monetary amounts are in USD with 2 decimal places
- File uploads have a maximum size of 5MB
- Pagination returns 10 items per page by default

---

For complete Django backend implementation, see **[DJANGO_BACKEND_GUIDE.md](./DJANGO_BACKEND_GUIDE.md)**
