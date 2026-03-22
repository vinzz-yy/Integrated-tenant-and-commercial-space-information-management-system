import { Link, useLocation } from 'react-router';
import { cn } from './ui/utils';
import { LayoutDashboard, Users, FileCheck, Calendar, Settings, PhilippinePeso, Building, ClipboardList, CreditCard, Wrench, UserCog } from 'lucide-react';

// Admin menu items organized by section
const adminMenuItems = {
  management: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'User Profiles', path: '/admin/users' },
    { icon: Building, label: 'Commercial Space', path: '/admin/commercial-space' },
    { icon: PhilippinePeso, label: 'Financials', path: '/admin/financial' },
    { icon: FileCheck, label: 'Compliance', path: '/admin/compliance' },
    { icon: Calendar, label: 'Scheduling', path: '/admin/schedule' },
    { icon: Settings, label: 'Operations', path: '/admin/operations' },
  ],
  system: [
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ]
};

// Staff menu items organized by section
const staffMenuItems = {
  management: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/staff' },
    { icon: UserCog, label: 'My Profile', path: '/staff/profile' },
    { icon: PhilippinePeso, label: 'Financial', path: '/staff/financial' },
    { icon: Building, label: 'Commercial Space', path: '/staff/commercial-space' },
    { icon: FileCheck, label: 'Compliance', path: '/staff/compliance' },
    { icon: Calendar, label: 'Schedule', path: '/staff/schedule' },
    { icon: ClipboardList, label: 'Operations', path: '/staff/operations' },
  ],
  system: [
    { icon: Settings, label: 'Settings', path: '/staff/settings' },
  ]
};

// Tenant menu items organized by section
const tenantMenuItems = {
  management: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/tenant' },
    { icon: UserCog, label: 'My Profile', path: '/tenant/profile' },
    { icon: Building, label: 'Commercial Space', path: '/tenant/commercial-space' },
    { icon: FileCheck, label: 'Documents', path: '/tenant/compliance' },
    { icon: CreditCard, label: 'Payments', path: '/tenant/payments' },
    { icon: Calendar, label: 'Appointments', path: '/tenant/appointments' },
    { icon: Wrench, label: 'Maintenance', path: '/tenant/maintenance' },
  ],
  system: [
    { icon: Settings, label: 'Settings', path: '/tenant/settings' },
  ]
};

// Sidebar component that renders navigation menu based on user role
export function Sidebar({ role }) {
  const location = useLocation();

  // Select menu items based on user role
  const menuItems = role === 'admin'
    ? adminMenuItems
    : role === 'staff'
    ? staffMenuItems
    : tenantMenuItems;

  // Helper function to render a menu section with title
  const renderMenuSection = (items, sectionTitle) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="space-y-1">
        {sectionTitle && (
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {sectionTitle}
            </h3>
          </div>
        )}
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white border-r h-[calc(100vh-64px)] sticky top-16 hidden md:block overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Render Management section */}
        {renderMenuSection(menuItems.management, 'Management')}
        {/* Render System section */}
        {renderMenuSection(menuItems.system, 'System')}
      </div>
    </aside>
  );
}