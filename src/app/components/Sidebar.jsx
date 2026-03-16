import { Link, useLocation } from 'react-router';
import { cn } from './ui/utils';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Calendar,
  Settings,
  DollarSign,
  Building,
  ClipboardList,
  CreditCard,
  Wrench,
  UserCog,
} from 'lucide-react';

// Admin menu items organized by section
const adminMenuItems = {
  management: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'User Profiles', path: '/admin/users' },
    { icon: Building, label: 'Commercial Space', path: '/admin/commercial-space' },
    { icon: DollarSign, label: 'Financials', path: '/admin/financial' },
    { icon: FileCheck, label: 'Compliance', path: '/admin/compliance' },
    { icon: Calendar, label: 'Scheduling', path: '/admin/schedule' },
    { icon: Settings, label: 'Operations', path: '/admin/operations' },
  ],
  system: [
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ]
};

const staffMenuItems = {
  management: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/staff' },
    { icon: UserCog, label: 'My Profile', path: '/staff/profile' },
    { icon: DollarSign, label: 'Financial', path: '/staff/financial' },
    { icon: Building, label: 'Commercial Space', path: '/staff/commercial-space' },
    { icon: FileCheck, label: 'Compliance', path: '/staff/compliance' },
    { icon: Calendar, label: 'Schedule', path: '/staff/schedule' },
    { icon: ClipboardList, label: 'Operations', path: '/staff/operations' },
  ],
  system: [
    { icon: Settings, label: 'Settings', path: '/staff/settings' },
  ]
};

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

export function Sidebar({ role }) {
  const location = useLocation();

  const menuItems = role === 'admin'
    ? adminMenuItems
    : role === 'staff'
    ? staffMenuItems
    : tenantMenuItems;

  const renderMenuSection = (items, sectionTitle) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="space-y-1">
        {sectionTitle && (
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
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
    <aside className="w-64 bg-white dark:bg-gray-900 border-r h-[calc(100vh-4rem)] sticky top-16 flex flex-col">
      <nav className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* MANAGEMENT Section */}
        {renderMenuSection(menuItems.management, 'MANAGEMENT')}
        
        {/* SYSTEM Section */}
        {menuItems.system && menuItems.system.length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
            {renderMenuSection(menuItems.system, 'SYSTEM')}
          </>
        )}
      </nav>
    </aside>
  );
}