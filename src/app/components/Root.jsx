import { Outlet } from 'react-router';

// Root layout component that renders child routes through Outlet
export function Root() {
  return <Outlet />;
}