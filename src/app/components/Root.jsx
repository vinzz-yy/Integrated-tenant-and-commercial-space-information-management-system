import { Outlet, Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

// Root layout component that renders child routes through Outlet
export function Root() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const mustChangePassword =
    Boolean(user?.mustChangePassword) ||
    Boolean(user?.must_change_password) ||
    Boolean(user?.profile?.must_change_password);

  // Force staff/tenant to settings until password is changed
  if (
    isAuthenticated &&
    user?.role === 'staff' &&
    mustChangePassword &&
    location.pathname !== '/staff/settings'
  ) {
    return <Navigate to="/staff/settings" replace state={{ forcedPasswordChange: true }} />;
  }
  if (
    isAuthenticated &&
    user?.role === 'tenant' &&
    mustChangePassword &&
    location.pathname !== '/tenant/settings'
  ) {
    return <Navigate to="/tenant/settings" replace state={{ forcedPasswordChange: true }} />;
  }

  return <Outlet />;
}