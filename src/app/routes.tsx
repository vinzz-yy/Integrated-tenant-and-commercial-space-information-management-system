import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { ComplianceManagement } from "./pages/admin/ComplianceManagement";
import { ScheduleManagement } from "./pages/admin/ScheduleManagement";
import { OperationsManagement } from "./pages/admin/OperationsManagement";
import { FinancialManagement } from "./pages/admin/FinancialManagement";
import { CommercialSpaceManagement } from "./pages/admin/CommercialSpaceManagement";
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { StaffProfile } from "./pages/staff/StaffProfile";
import { StaffCompliance } from "./pages/staff/StaffCompliance";
import { StaffSchedule } from "./pages/staff/StaffSchedule";
import { StaffOperations } from "./pages/staff/StaffOperations";
import { StaffFinancial } from "./pages/staff/StaffFinancial";
import { StaffCommercialSpace } from "./pages/staff/StaffCommercialSpace";
import { TenantDashboard } from "./pages/tenant/TenantDashboard";
import { TenantProfile } from "./pages/tenant/TenantProfile";
import { TenantCompliance } from "./pages/tenant/TenantCompliance";
import { TenantAppointments } from "./pages/tenant/TenantAppointments";
import { TenantPayments } from "./pages/tenant/TenantPayments";
import { TenantMaintenance } from "./pages/tenant/TenantMaintenance";
import { TenantCommercialSpace } from "./pages/tenant/TenantCommercialSpace";
import { Login } from "../app/pages/Login";


export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      
      // Admin Routes
      { path: "admin", Component: AdminDashboard },
      { path: "admin/users", Component: UserManagement },
      { path: "admin/compliance", Component: ComplianceManagement },
      { path: "admin/schedule", Component: ScheduleManagement },
      { path: "admin/operations", Component: OperationsManagement },
      { path: "admin/financial", Component: FinancialManagement },
      { path: "admin/commercial-space", Component: CommercialSpaceManagement },
      
      // Staff Routes
      { path: "staff", Component: StaffDashboard },
      { path: "staff/profile", Component: StaffProfile },
      { path: "staff/compliance", Component: StaffCompliance },
      { path: "staff/schedule", Component: StaffSchedule },
      { path: "staff/operations", Component: StaffOperations },
      { path: "staff/financial", Component: StaffFinancial },
      { path: "staff/commercial-space", Component: StaffCommercialSpace },
      
      // Tenant Routes
      { path: "tenant", Component: TenantDashboard },
      { path: "tenant/profile", Component: TenantProfile },
      { path: "tenant/compliance", Component: TenantCompliance },
      { path: "tenant/appointments", Component: TenantAppointments },
      { path: "tenant/payments", Component: TenantPayments },
      { path: "tenant/maintenance", Component: TenantMaintenance },
      { path: "tenant/commercial-space", Component: TenantCommercialSpace },
      
      { path: "*", Component: Login },
    ],
  },
]);
