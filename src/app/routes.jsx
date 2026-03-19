import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root.jsx";
import { AdminDashboard } from "./pages/admin/AdminDashboard.jsx";
import { UserManagement } from "./pages/admin/UserManagement.jsx";
import { ComplianceManagement } from "./pages/admin/ComplianceManagement.jsx";
import { ScheduleManagement } from "./pages/admin/ScheduleManagement.jsx";
import { OperationsManagement } from "./pages/admin/OperationsManagement.jsx";
import { FinancialManagement } from "./pages/admin/FinancialManagement.jsx";
import { CommercialSpaceManagement } from "./pages/admin/CommercialSpaceManagement.jsx";
import { StaffDashboard } from "./pages/staff/StaffDashboard.jsx";
import { StaffProfile } from "./pages/staff/StaffProfile.jsx";
import { StaffCompliance } from "./pages/staff/StaffCompliance.jsx";
import { StaffSchedule } from "./pages/staff/StaffSchedule.jsx";
import { StaffOperations } from "./pages/staff/StaffOperations.jsx";
import { StaffFinancial } from "./pages/staff/StaffFinancial.jsx";
import { StaffCommercialSpace } from "./pages/staff/StaffCommercialSpace.jsx";
import { TenantDashboard } from "./pages/tenant/TenantDashboard.jsx";
import { TenantProfile } from "./pages/tenant/TenantProfile.jsx";
import { TenantCompliance } from "./pages/tenant/TenantCompliance.jsx";
import { TenantAppointments } from "./pages/tenant/TenantAppointments.jsx";
import { TenantPayments } from "./pages/tenant/TenantPayments.jsx";
import { TenantMaintenance } from "./pages/tenant/TenantMaintenance.jsx";
import { TenantCommercialSpace } from "./pages/tenant/TenantCommercialSpace.jsx";
import { Login } from "./pages/Login.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "admin", Component: AdminDashboard },
      { path: "admin/users", Component: UserManagement },
      { path: "admin/compliance", Component: ComplianceManagement },
      { path: "admin/schedule", Component: ScheduleManagement },
      { path: "admin/operations", Component: OperationsManagement },
      { path: "admin/financial", Component: FinancialManagement },
      { path: "admin/commercial-space", Component: CommercialSpaceManagement },
      { path: "staff", Component: StaffDashboard },
      { path: "staff/profile", Component: StaffProfile },
      { path: "staff/compliance", Component: StaffCompliance },
      { path: "staff/schedule", Component: StaffSchedule },
      { path: "staff/operations", Component: StaffOperations },
      { path: "staff/financial", Component: StaffFinancial },
      { path: "staff/commercial-space", Component: StaffCommercialSpace },
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
