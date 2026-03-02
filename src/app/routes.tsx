import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUsers } from './pages/admin/Users';
import { AdminSpaces } from './pages/admin/Spaces';
import { AdminFinance } from './pages/admin/Finance';
import { AdminDocuments } from './pages/admin/Documents';
import { AdminOperations } from './pages/admin/Operations';
import { StaffDashboard } from './pages/staff/Dashboard';
import { StaffProfile } from './pages/staff/Profile';
import { TenantDashboard } from './pages/tenant/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/admin',
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'spaces', element: <AdminSpaces /> },
      { path: 'finance', element: <AdminFinance /> },
      { path: 'documents', element: <AdminDocuments /> },
      { path: 'operations', element: <AdminOperations /> },
    ],
  },
  {
    path: '/staff',
    children: [
      { index: true, element: <Navigate to="/staff/dashboard" replace /> },
      { path: 'dashboard', element: <StaffDashboard /> },
      { path: 'profile', element: <StaffProfile /> },
      { path: 'spaces', element: <AdminSpaces /> }, // Reuse admin component with limited permissions
      { path: 'documents', element: <AdminDocuments /> }, // Reuse admin component
      { path: 'schedule', element: <StaffDashboard /> }, // Simplified for demo
      { path: 'operations', element: <AdminOperations /> }, // Reuse admin component
    ],
  },
  {
    path: '/tenant',
    children: [
      { index: true, element: <Navigate to="/tenant/dashboard" replace /> },
      { path: 'dashboard', element: <TenantDashboard /> },
      { path: 'profile', element: <StaffProfile /> }, // Reuse staff profile
      { path: 'unit', element: <TenantDashboard /> }, // Info shown in dashboard
      { path: 'documents', element: <AdminDocuments /> }, // Reuse with tenant filter
      { path: 'schedule', element: <TenantDashboard /> }, // Info shown in dashboard
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);