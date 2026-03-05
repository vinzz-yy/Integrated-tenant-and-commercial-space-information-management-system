import { Link, useLocation, useNavigate } from 'react-router';
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
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'User Management', path: '/admin/users' },
  { icon: DollarSign, label: 'Financial', path: '/admin/financial' },
  { icon: Building, label: 'Commercial Space', path: '/admin/commercial-space' },
  { icon: FileCheck, label: 'Compliance', path: '/admin/compliance' },
  { icon: Calendar, label: 'Schedule', path: '/admin/schedule' },
  { icon: Settings, label: 'Operations', path: '/admin/operations' },
];

const staffMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/staff' },
  { icon: UserCog, label: 'My Profile', path: '/staff/profile' },
  { icon: DollarSign, label: 'Financial', path: '/staff/financial' },
  { icon: Building, label: 'Commercial Space', path: '/staff/commercial-space' },
  { icon: FileCheck, label: 'Compliance', path: '/staff/compliance' },
  { icon: Calendar, label: 'Schedule', path: '/staff/schedule' },
  { icon: ClipboardList, label: 'Operations', path: '/staff/operations' },
];

const tenantMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/tenant' },
  { icon: UserCog, label: 'My Profile', path: '/tenant/profile' },
  { icon: Building, label: 'Commercial Space', path: '/tenant/commercial-space' },
  { icon: FileCheck, label: 'Documents', path: '/tenant/compliance' },
  { icon: CreditCard, label: 'Payments', path: '/tenant/payments' },
  { icon: Calendar, label: 'Appointments', path: '/tenant/appointments' },
  { icon: Wrench, label: 'Maintenance', path: '/tenant/maintenance' },
];

export function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const menuItems = role === 'admin'
    ? adminMenuItems
    : role === 'staff'
    ? staffMenuItems
    : tenantMenuItems;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('../login', { replace: true });
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <aside className="w-64 bg-white dark:bg-gray-900 border-r h-[calc(100vh-4rem)] sticky top-16 flex flex-col">
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t dark:border-gray-800">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full',
              'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              'hover:text-red-600 dark:hover:text-red-400'
            )}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Logout</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogoutModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
