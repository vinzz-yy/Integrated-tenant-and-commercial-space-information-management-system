import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Sun, Moon, User, LogOut, Building2, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsLogoutModalOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}`;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'staff':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'tenant':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <>
      <nav className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50 shadow-sm w-full min-w-[320px]">
        <div className="mx-auto w-full px-2 sm:px-4 lg:px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            {/* Logo Section - Fixed width to prevent wrapping */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-fit">
              <div className="bg-blue-600 rounded-lg p-1 sm:p-1.5 flex-shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <Link to={getDashboardLink()} className="flex flex-col flex-shrink-0">
                <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white leading-tight whitespace-nowrap">
                  LA Union Sky Mall
                </span>
                <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 leading-tight whitespace-nowrap hidden xs:inline">
                  Integrated Tenant & Commercial Space Management
                </span>
              </Link>
            </div>

            {/* Right Section - Fixed layout */}
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>
              
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-1 sm:gap-3 px-1.5 sm:px-2 py-1 sm:py-1.5 h-auto hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex-shrink-0"
                    >
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <AvatarImage src={user.avatar} alt={user.firstName} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] sm:text-xs">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* User info - Hidden on very small screens to prevent overflow */}
                      <div className="hidden lg:flex flex-col items-start min-w-0 max-w-[150px]">
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate w-full">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 sm:w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-xs sm:text-sm font-medium leading-none truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[10px] sm:text-xs leading-none text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate(`/${user.role}/profile`)}
                      className="cursor-pointer text-xs sm:text-sm"
                    >
                      <User className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate(`/${user.role}`)}
                      className="cursor-pointer text-xs sm:text-sm"
                    >
                      <LayoutDashboard className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 text-xs sm:text-sm"
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>

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