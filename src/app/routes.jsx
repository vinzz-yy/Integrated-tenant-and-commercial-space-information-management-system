import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root.jsx";
import { AdminDashboard } from "./pages/admin/AdminDashboard.jsx";
import { UserManagement } from "./pages/admin/UserManagement.jsx";
import { Documents as AdminDocuments } from "./pages/admin/Documents.jsx";
import { Events as AdminEvents } from "./pages/admin/Events.jsx";
import { Compliance as AdminCompliance } from "./pages/admin/Compliance.jsx";
import { FinancialManagement } from "./pages/admin/FinancialManagement.jsx";
import { CommercialSpaceManagement } from "./pages/admin/CommercialSpaceManagement.jsx";
import { StaffDashboard } from "./pages/staff/StaffDashboard.jsx";
import { StaffProfile } from "./pages/staff/StaffProfile.jsx";
import { Documents as StaffDocuments } from "./pages/staff/Documents.jsx";
import { Events as StaffEvents } from "./pages/staff/Events.jsx";
import { Compliance as StaffCompliance } from "./pages/staff/Compliance.jsx";
import { StaffFinancial } from "./pages/staff/StaffFinancial.jsx";
import { StaffCommercialSpace } from "./pages/staff/StaffCommercialSpace.jsx";
import { StaffUserManagement } from "./pages/staff/StaffUserManagement.jsx";
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
      { path: "admin/Documents", Component: AdminDocuments },
      { path: "admin/Events", Component: AdminEvents },
      { path: "admin/Compliance", Component: AdminCompliance },
      { path: "admin/financial", Component: FinancialManagement },
      { path: "admin/commercial-space", Component: CommercialSpaceManagement },
      { path: "staff", Component: StaffDashboard },
      { path: "staff/users", Component: StaffUserManagement },
      { path: "staff/profile", Component: StaffProfile },
      { path: "staff/Documents", Component: StaffDocuments },
      { path: "staff/Events", Component: StaffEvents },
      { path: "staff/Compliance", Component: StaffCompliance },
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
