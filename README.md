# LA Union Skymall Corporation
## Property Management System - React Frontend

A comprehensive, fully functional web application for integrated tenant and commercial space information management.

---

## 🌟 Features

### **Admin System**
- ✅ Real-time dashboard with analytics and KPIs
- ✅ Complete user management (CRUD operations)
- ✅ Compliance document management with approval workflows
- ✅ Appointment scheduling system
- ✅ Operations request tracking
- ✅ Financial management (invoices, payments, reports)
- ✅ Commercial space unit management
- ✅ Bulk user import/export
- ✅ Advanced filtering and search

### **Staff System**
- ✅ Role-specific dashboard
- ✅ Profile management
- ✅ View compliance documents (read-only)
- ✅ Schedule management
- ✅ Operation request handling
- ✅ Basic financial reporting
- ✅ Commercial space editing capabilities

### **Tenant System**
- ✅ Personal dashboard with account overview
- ✅ Self-service profile management
- ✅ Document upload for compliance
- ✅ Appointment booking
- ✅ Online payment portal
- ✅ Maintenance request submission
- ✅ View commercial unit details

---

## 🚀 Technology Stack

- **Frontend Framework:** React 18.3.1
- **Routing:** React Router 7.13.0
- **Styling:** Tailwind CSS 4.1.12
- **UI Components:** Radix UI
- **Charts:** Recharts 2.15.2
- **Forms:** React Hook Form 7.55.0
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Theme:** Dark/Light mode support

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Steps

1. **Install dependencies:**
```bash
npm install
# or
pnpm install
```

2. **Set up environment variables:**

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

3. **Run the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

4. **Build for production:**
```bash
npm run build
```

---

## 🔐 Authentication

### Demo Accounts

The application includes three demo accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@skymall.com | password |
| **Staff** | staff@skymall.com | password |
| **Tenant** | tenant@skymall.com | password |

### User Roles & Permissions

#### Admin
- Full system access
- User management (create, edit, delete users)
- Approve/reject compliance documents
- Create invoices and process payments
- Manage all commercial units
- View all reports and analytics

#### Staff
- Limited administrative access
- View compliance documents (read-only)
- Manage schedules and appointments
- Handle operation requests
- View financial reports
- Edit commercial unit details

#### Tenant
- Personal account access only
- Upload compliance documents
- Book appointments
- Pay invoices online
- Submit maintenance requests
- View assigned commercial unit

---

## 🏗️ Project Structure

```
/src
├── /app
│   ├── App.tsx                 # Main application component
│   ├── routes.tsx              # Route definitions
│   │
│   ├── /components
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── Sidebar.tsx         # Side navigation menu
│   │   ├── Root.tsx            # Root component
│   │   └── /ui                 # Reusable UI components
│   │
│   ├── /context
│   │   ├── AuthContext.tsx     # Authentication state management
│   │   └── ThemeContext.tsx    # Theme (dark/light) management
│   │
│   ├── /pages
│   │   ├── Login.tsx           # Login page
│   │   ├── NotFound.tsx        # 404 page
│   │   │
│   │   ├── /admin              # Admin pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── ComplianceManagement.tsx
│   │   │   ├── ScheduleManagement.tsx
│   │   │   ├── OperationsManagement.tsx
│   │   │   ├── FinancialManagement.tsx
│   │   │   └── CommercialSpaceManagement.tsx
│   │   │
│   │   ├── /staff              # Staff pages
│   │   │   ├── StaffDashboard.tsx
│   │   │   ├── StaffProfile.tsx
│   │   │   ├── StaffCompliance.tsx
│   │   │   ├── StaffSchedule.tsx
│   │   │   ├── StaffOperations.tsx
│   │   │   ├── StaffFinancial.tsx
│   │   │   └── StaffCommercialSpace.tsx
│   │   │
│   │   └── /tenant             # Tenant pages
│   │       ├── TenantDashboard.tsx
│   │       ├── TenantProfile.tsx
│   │       ├── TenantCompliance.tsx
│   │       ├── TenantAppointments.tsx
│   │       ├── TenantPayments.tsx
│   │       ├── TenantMaintenance.tsx
│   │       └── TenantCommercialSpace.tsx
│   │
│   └── /services
│       ├── api.ts              # API service layer (Django integration)
│       └── mockData.ts         # Mock data for development
│
└── /styles
    ├── index.css
    ├── tailwind.css
    ├── theme.css
    └── fonts.css
```

---

## 🔌 Backend Integration

This React frontend is designed to integrate with a **Django REST Framework** backend.

### Django Backend Setup

Refer to the comprehensive guide:
📄 **[DJANGO_BACKEND_GUIDE.md](./DJANGO_BACKEND_GUIDE.md)**

This guide includes:
- Complete Django project setup
- Database models for all modules
- API endpoint definitions
- Authentication with JWT
- CORS configuration
- File upload handling
- Environment variables
- Migration commands

### API Integration Points

All API calls are centralized in `/src/app/services/api.ts` with clear comments indicating:

```typescript
// DJANGO BACKEND INTEGRATION POINT
// API Call: POST /api/auth/login/
// Request: { email: string, password: string }
// Response: { access_token: string, refresh_token: string, user: User }
```

Each function includes:
- HTTP method (GET, POST, PATCH, DELETE)
- Endpoint URL
- Request body structure
- Expected response format
- Django model reference

---

## 📊 Key Modules

### 1. **User Management**
- Create, read, update, delete users
- Role-based access control
- Bulk import from CSV/Excel
- User activity logs
- Profile photo management

### 2. **Compliance Management**
- Document upload and categorization
- Version control
- Approval workflow
- Expiration tracking
- Automated reminders
- Audit logs

### 3. **Schedule Management**
- Multi-calendar system
- Appointment booking
- Resource allocation
- Email/SMS notifications
- Calendar integration

### 4. **Operations Management**
- Request ticketing system
- Priority levels
- Task assignment
- Activity tracking
- Performance metrics

### 5. **Financial Management**
- Invoice generation
- Payment processing
- Revenue analytics
- Profit & loss reports
- Payment history
- Automated billing

### 6. **Commercial Space Management**
- Unit database
- Floor plans
- Occupancy tracking
- Tenant assignment
- Lease management
- Status monitoring

### 7. **Maintenance Management**
- Request submission
- Priority classification
- Status tracking
- File attachments
- Assignment workflow

---

## 🎨 UI/UX Features

### Design System
- **Modern Interface:** Clean, professional design
- **Responsive Layout:** Mobile, tablet, and desktop support
- **Dark Mode:** Full dark theme support
- **Accessibility:** WCAG 2.1 compliant
- **Animations:** Smooth transitions and interactions

### Components
- **Data Tables:** Sortable, filterable, paginated
- **Charts:** Interactive revenue and analytics charts
- **Forms:** Validated with React Hook Form
- **Modals:** Accessible dialog components
- **Notifications:** Toast notifications with Sonner
- **Calendars:** Interactive date pickers

---

## 🔒 Security Features

- **JWT Authentication:** Secure token-based auth
- **Role-Based Access Control:** Granular permissions
- **Input Validation:** Client-side and server-side
- **HTTPS Ready:** Secure data transmission
- **CORS Protection:** Configured for Django backend
- **XSS Protection:** Sanitized inputs
- **File Upload Security:** Type and size restrictions

---

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

All dashboards, tables, and forms adapt seamlessly to different screen sizes.

---

## 🧪 Development

### Running in Development Mode

```bash
npm run dev
```

### Mock Data

The application uses mock data for development. All mock data is in:
- `/src/app/services/mockData.ts`

Replace with actual API calls when backend is ready.

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `/dist` folder.

### Deployment Options

1. **Vercel:** 
```bash
vercel deploy
```

2. **Netlify:**
```bash
netlify deploy --prod
```

3. **Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

---

## 📈 Performance Optimization

- **Code Splitting:** Route-based lazy loading
- **Asset Optimization:** Vite build optimization
- **Caching:** Service worker ready
- **Image Optimization:** WebP support
- **Bundle Size:** Tree shaking enabled

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary software developed for LA Union Skymall Corporation.

---

## 📞 Support

For technical support or questions:
- Email: support@launionskymall.com
- Phone: +1 (555) 100-1000

---

## 🙏 Acknowledgments

- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Recharts** - Composable charting library
- **React Router** - Declarative routing
- **Lucide** - Beautiful icon library

---

**Built with ❤️ for LA Union Skymall Corporation**
