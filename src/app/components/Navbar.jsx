import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { Bell, CheckCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import connection from '../connected/connection.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu.jsx';
import { Badge } from './ui/badge.jsx';
import mannaLogo from '../images/manna_logo.png';

// Navbar component with notifications
export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}`;
  };

  const getEventsLink = () => {
    if (!user) return '/';
    return user.role === 'tenant' ? '/tenant/appointments' : `/${user.role}/Events`;
  };

  useEffect(() => {
    if (user) {
      Promise.allSettled([
        connection.notifications.getNotifications({ read: false, limit: 5 }),
        connection.events.getAppointments({ status: 'scheduled' })
      ]).then(([notifResp, apptResp]) => {
        let combined = [];

        if (notifResp.status === 'fulfilled') {
          const notifData = Array.isArray(notifResp.value) ? notifResp.value : (notifResp.value?.results || []);
          combined = [...combined, ...notifData];
        }

        if (apptResp.status === 'fulfilled') {
          const apptData = Array.isArray(apptResp.value) ? apptResp.value : (apptResp.value?.results || []);
          const apptNotifications = apptData.map(appt => ({
            id: `appt-${appt.id}`,
            type: 'event', // custom type
            title: `Upcoming Event: ${appt.title || 'Appointment'}`,
            message: `Scheduled for ${new Date(appt.date).toLocaleDateString()} at ${appt.time || ''}`,
            createdAt: appt.created_at || new Date().toISOString(),
            read: false, 
            isEvent: true
          }));
          combined = [...combined, ...apptNotifications];
        }

        // Sort by newest first
        combined.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
        setNotifications(combined.slice(0, 10));
      }).catch(console.error);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm w-full min-w-[320px]">
      <div className="mx-auto w-full px-2 sm:px-4 lg:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Logo */}
            <img 
              src={mannaLogo} 
              alt="Company Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain flex-shrink-0"
            />

            {/* Brand name & subtitle */}
            <Link to={getDashboardLink()} className="flex flex-col flex-shrink-0">
              <span className="font-bold text-sm sm:text-base text-[#2E3192] leading-tight whitespace-nowrap">
                LA Union Sky Mall
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 leading-tight whitespace-nowrap hidden xs:inline">
                Integrated Tenant & Commercial Space Management
              </span>
            </Link>
          </div>

          {/* Right side icons */}
          {user && (
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors outline-none cursor-pointer">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="font-semibold text-sm">Notifications & Events</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs rounded-full">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="flex flex-col">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            onClick={() => navigate(getEventsLink())}
                            className="cursor-pointer flex items-start gap-3 p-3 border-b last:border-0 border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                          >
                            {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />}
                            {notification.type === 'warning' && <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />}
                            {notification.type === 'info' && <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />}
                            {notification.type === 'event' && <Calendar className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />}
                            {!['success', 'warning', 'info', 'event'].includes(notification.type) && <Bell className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />}
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 leading-tight">{notification.title}</p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1.5">
                                {new Date(notification.createdAt || notification.created_at).toLocaleDateString('en-PH', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-sm text-gray-500">
                        No new notifications or events
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}