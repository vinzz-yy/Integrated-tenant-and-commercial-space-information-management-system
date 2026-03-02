# Commercial Space Management System

A comprehensive web application for managing commercial real estate properties with role-based access control.

## 🏢 Overview

This system provides three distinct user interfaces for different roles:
- **Admin Portal** - Full system management and oversight
- **Staff Portal** - Operational tasks and compliance
- **Tenant Portal** - Self-service for tenants

## 🔑 Demo Credentials

### Admin Access
- **Email:** admin@commercialspace.com
- **Password:** any text (demo mode)

### Staff Access
- **Email:** sarah.staff@commercialspace.com
- **Password:** any text (demo mode)

### Tenant Access
- **Email:** alice.tenant@email.com
- **Password:** any text (demo mode)

## 📋 Features

### ADMIN SYSTEM

#### Dashboard
- Real-time KPIs (users, occupancy rate, revenue, alerts)
- Revenue trend charts (6-month view)
- Space occupancy pie chart
- Pending payments overview
- Active maintenance requests

#### User Management
- CRUD operations for all users
- Role assignment (Admin/Staff/Tenant)
- User status management (Active/Inactive)
- Search and filter functionality
- Activity tracking

#### Commercial Space Management
- Complete space inventory
- Unit details: number, floor, size, rental rates
- Status tracking: Vacant, Occupied, Reserved, Under Maintenance
- Tenant-unit assignments
- Lease contract information
- Filtering by status and type

#### Financial Management
- Revenue monitoring dashboard
- Payment tracking (Paid/Pending/Overdue)
- Collection rate analytics
- Revenue trend analysis
- Payment history with detailed records
- Export functionality for reports

#### Document Management
- Document upload and storage
- Category management: Contracts, Permits, Compliance, Invoices, Reports
- Approval workflows
- Search and filter by type
- Document status tracking

#### Operations Management
- Maintenance request handling
- Priority levels: Low, Medium, High, Urgent
- Status tracking: Open, In Progress, Completed, Cancelled
- Task assignment to staff
- Upcoming schedule view
- Work order management

### STAFF SYSTEM

#### Dashboard
- Assigned tasks overview
- Personal schedule
- Compliance status
- Recent activity log
- Quick access to pending items

#### Profile Management
- Personal information editing
- Contact details
- Account security settings
- Activity history

#### Space Monitoring
- View all commercial spaces
- Update space status
- Access to unit information
- Tenant contact details

#### Document Submission
- Upload compliance documents
- Track document status
- Submit reports
- View approved documents

#### Schedule Management
- View appointments
- Maintenance schedules
- Inspection timelines
- Meeting requests

### TENANT SYSTEM

#### Dashboard
- Lease information overview
- Current unit details
- Payment history
- Compliance status
- Announcements
- Upcoming appointments

#### Profile
- View and edit personal information
- Contact details
- Account settings

#### Unit Information
- Assigned space details
- Lease terms and conditions
- Monthly rent information
- Lease start/end dates

#### Document Management
- Upload required documents
- Track compliance requirements
- View lease agreements
- Access invoices

#### Appointments
- Request maintenance
- Schedule viewings
- Meeting requests
- View upcoming appointments

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **React Router 7** - Navigation and routing
- **Tailwind CSS v4** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Radix UI** - Accessible component primitives

### State Management
- React Context API for authentication
- Local state with useState
- Mock data for demonstration

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   └── Layout.tsx    # Main layout with sidebar
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── data/
│   │   └── mockData.ts   # Demo data
│   ├── pages/
│   │   ├── admin/        # Admin pages
│   │   ├── staff/        # Staff pages
│   │   ├── tenant/       # Tenant pages
│   │   ├── Login.tsx
│   │   └── NotFound.tsx
│   ├── lib/
│   │   └── utils.ts      # Utility functions
│   ├── types.ts          # TypeScript type definitions
│   ├── routes.tsx        # Route configuration
│   └── App.tsx          # Main application component
└── styles/               # Global styles
```

## 🎨 Design Features

- **Responsive Design** - Optimized for desktop viewing
- **Modern UI** - Clean, professional interface
- **Role-based Navigation** - Dynamic sidebar based on user role
- **Interactive Charts** - Visual data representation
- **Search & Filter** - Quick data access
- **Status Badges** - Clear visual indicators
- **Data Tables** - Organized information display

## 🔒 Security Features (Production Ready)

For production deployment, implement:
- Proper authentication with JWT tokens
- Row-level security for database
- HTTPS encryption
- Input validation and sanitization
- CSRF protection
- Rate limiting
- Audit logging
- Data encryption at rest

## 📊 Mock Data

The application uses comprehensive mock data including:
- 7 users (1 admin, 2 staff, 4 tenants)
- 8 commercial spaces
- 4 active leases
- Payment records
- Maintenance requests
- Documents
- Schedules

## 🚀 Getting Started

1. The application starts at the login page
2. Use any of the demo credentials above
3. Navigate through role-specific features
4. All data is stored in memory (refreshes on reload)

## 💡 Future Enhancements

- Real backend integration with Django REST API
- PostgreSQL database
- Real-time notifications
- Email notifications
- Advanced reporting with PDF export
- Mobile responsive design
- Multi-language support
- Payment gateway integration
- Automated lease renewals
- Bulk operations
- Advanced analytics dashboard

## 📝 Notes

This is a frontend demonstration using mock data. For production:
1. Integrate with Django REST API
2. Implement proper authentication
3. Connect to PostgreSQL database
4. Add data validation
5. Implement error handling
6. Add loading states
7. Implement pagination for large datasets
8. Add confirmation dialogs for critical actions
9. Implement proper file upload handling
10. Add comprehensive logging and monitoring

## 🤝 Support

For questions or issues, please refer to the system documentation or contact your system administrator.
