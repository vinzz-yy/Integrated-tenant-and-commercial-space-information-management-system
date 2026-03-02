import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  DollarSign, 
  FileText, 
  Wrench, 
  LogOut,
  Calendar,
  User
} from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles?: string[];
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = (): NavItem[] => {
    if (currentUser?.role === 'admin') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { label: 'Users', icon: Users, path: '/admin/users' },
        { label: 'Spaces', icon: Building2, path: '/admin/spaces' },
        { label: 'Finance', icon: DollarSign, path: '/admin/finance' },
        { label: 'Documents', icon: FileText, path: '/admin/documents' },
        { label: 'Operations', icon: Wrench, path: '/admin/operations' },
      ];
    } else if (currentUser?.role === 'staff') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
        { label: 'Profile', icon: User, path: '/staff/profile' },
        { label: 'Spaces', icon: Building2, path: '/staff/spaces' },
        { label: 'Documents', icon: FileText, path: '/staff/documents' },
        { label: 'Schedule', icon: Calendar, path: '/staff/schedule' },
        { label: 'Operations', icon: Wrench, path: '/staff/operations' },
      ];
    } else if (currentUser?.role === 'tenant') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/tenant/dashboard' },
        { label: 'Profile', icon: User, path: '/tenant/profile' },
        { label: 'My Unit', icon: Building2, path: '/tenant/unit' },
        { label: 'Documents', icon: FileText, path: '/tenant/documents' },
        { label: 'Schedule', icon: Calendar, path: '/tenant/schedule' },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Commercial Space</h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentUser?.role === 'admin' ? 'Admin Portal' : 
             currentUser?.role === 'staff' ? 'Staff Portal' : 
             'Tenant Portal'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
            <p className="text-xs text-gray-500">{currentUser?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
