# Styling Guide for Integrated Tenant and Commercial Space Information Management System

This guide organizes the UI components and pages by their filenames and locations to help with design and styling tasks.

## Main Application Files
- **App.jsx** - [src/app/App.jsx](src/app/App.jsx) - Main application component
- **routes.jsx** - [src/app/routes.jsx](src/app/routes.jsx) - Application routing configuration
- **main.jsx** - [src/main.jsx](src/main.jsx) - Application entry point

## Layout Components
- **Layout.jsx** - [src/app/components/Layout.jsx](src/app/components/Layout.jsx) - Main layout wrapper
- **Navbar.jsx** - [src/app/components/Navbar.jsx](src/app/components/Navbar.jsx) - Navigation bar
- **Root.jsx** - [src/app/components/Root.jsx](src/app/components/Root.jsx) - Root component
- **Sidebar.jsx** - [src/app/components/Sidebar.jsx](src/app/components/Sidebar.jsx) - Sidebar navigation

## UI Components (shadcn/ui)
Located in [src/app/components/ui/](src/app/components/ui/)
- **accordion.jsx** - Accordion component
- **alert-dialog.jsx** - Alert dialog component
- **alert.jsx** - Alert component
- **aspect-ratio.jsx** - Aspect ratio component
- **avatar.jsx** - Avatar component
- **badge.jsx** - Badge component
- **breadcrumb.jsx** - Breadcrumb component
- **button.jsx** - Button component
- **calendar.jsx** - Calendar component
- **card.jsx** - Card component
- **carousel.jsx** - Carousel component
- **chart.jsx** - Chart component
- **checkbox.jsx** - Checkbox component
- **collapsible.jsx** - Collapsible component
- **command.jsx** - Command component
- **context-menu.jsx** - Context menu component
- **dialog.jsx** - Dialog component
- **drawer.jsx** - Drawer component
- **dropdown-menu.jsx** - Dropdown menu component
- **form.jsx** - Form component
- **hover-card.jsx** - Hover card component
- **input-otp.jsx** - Input OTP component
- **input.jsx** - Input component
- **label.jsx** - Label component
- **menubar.jsx** - Menubar component
- **navigation-menu.jsx** - Navigation menu component
- **pagination.jsx** - Pagination component
- **popover.jsx** - Popover component
- **progress.jsx** - Progress component
- **radio-group.jsx** - Radio group component
- **resizable.jsx** - Resizable component
- **scroll-area.jsx** - Scroll area component
- **select.jsx** - Select component
- **separator.jsx** - Separator component
- **sheet.jsx** - Sheet component
- **sidebar.jsx** - Sidebar component
- **skeleton.jsx** - Skeleton component
- **slider.jsx** - Slider component
- **sonner.jsx** - Sonner component
- **switch.jsx** - Switch component
- **table.jsx** - Table component
- **tabs.jsx** - Tabs component
- **textarea.jsx** - Textarea component
- **toggle-group.jsx** - Toggle group component
- **toggle.jsx** - Toggle component
- **tooltip.jsx** - Tooltip component
- **use-mobile.ts** - Mobile hook utility
- **utils.ts** - Utility functions

## Pages

### Authentication
- **Login.jsx** - [src/app/pages/Login.jsx](src/app/pages/Login.jsx) - Login page

### Admin Pages
Located in [src/app/pages/admin/](src/app/pages/admin/)
- **AdminDashboard.jsx** - Admin dashboard
- **UserManagement.jsx** - User management interface
- **ScheduleManagement.jsx** - Schedule management
- **FinancialReports.jsx** - Financial reports
- **ComplianceReports.jsx** - Compliance reports
- **CommercialSpaceManagement.jsx** - Commercial space management
- **TenantManagement.jsx** - Tenant management
- **MaintenanceManagement.jsx** - Maintenance management
- **AppointmentManagement.jsx** - Appointment management
- **NotificationManagement.jsx** - Notification management
- **PaymentManagement.jsx** - Payment management

### Staff Pages
Located in [src/app/pages/staff/](src/app/pages/staff/)
- **StaffDashboard.jsx** - Staff dashboard
- **StaffProfile.jsx** - Staff profile page
- **StaffSchedule.jsx** - Staff schedule
- **StaffOperations.jsx** - Staff operations
- **StaffFinancial.jsx** - Staff financial interface
- **StaffCompliance.jsx** - Staff compliance
- **StaffCommercialSpace.jsx** - Staff commercial space interface

### Tenant Pages
Located in [src/app/pages/tenant/](src/app/pages/tenant/)
- **TenantDashboard.jsx** - Tenant dashboard
- **TenantProfile.jsx** - Tenant profile page
- **TenantPayments.jsx** - Tenant payments
- **TenantMaintenance.jsx** - Tenant maintenance requests
- **TenantCompliance.jsx** - Tenant compliance
- **TenantCommercialSpace.jsx** - Tenant commercial space
- **TenantAppointments.jsx** - Tenant appointments

## Context and State Management
- **AuthContext.jsx** - [src/app/context/AuthContext.jsx](src/app/context/AuthContext.jsx) - Authentication context

## Utilities and Services
- **connection.js** - [src/app/connected/connection.js](src/app/connected/connection.js) - Connection utilities
- **export.js** - [src/app/exporting/export.js](src/app/exporting/export.js) - Export functionality

## Styles
Located in [src/styles/](src/styles/)
- **index.css** - Main CSS file
- **tailwind.css** - Tailwind CSS imports
- **theme.css** - Theme styles
- **fonts.css** - Font definitions

## Configuration Files
- **tailwind.config.js** - [tailwind.config.js](tailwind.config.js) - Tailwind configuration
- **tsconfig.json** - [tsconfig.json](tsconfig.json) - TypeScript configuration
- **tsconfig.node.json** - [tsconfig.node.json](tsconfig.node.json) - Node TypeScript configuration
- **vite.config.ts** - [vite.config.ts](vite.config.ts) - Vite configuration
- **package.json** - [package.json](package.json) - Project dependencies and scripts