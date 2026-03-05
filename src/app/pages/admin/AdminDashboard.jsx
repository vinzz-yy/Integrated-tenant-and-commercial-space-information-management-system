// AdminDashboard.jsx - Main dashboard for admin users showing system overview
// This component displays key metrics, charts, and notifications for administrators

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import api from '../../services/api.js';
import { 
  Users, 
  FileCheck, 
  Calendar, 
  DollarSign, 
  Building, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

export function AdminDashboard() {
  // Get current user from auth context and navigation hook
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing dashboard statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTenants: 0,
    totalStaff: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    pendingCompliance: 0,
    scheduledAppointments: 0,
  });

  // State for chart data and lists
  const [revenueData, setRevenueData] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Load all dashboard data when component mounts
  useEffect(() => {
    // Redirect non-admin users
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    
    // Async function to load all dashboard data
    const load = async () => {
      try {
        // Fetch user statistics
        const usersResp = await api.users.getUsers();
        const totalUsers = usersResp.count || (usersResp.results?.length || 0);
        const totalTenants = (usersResp.results || []).filter(u => u.role === 'tenant').length;
        const totalStaff = (usersResp.results || []).filter(u => u.role === 'staff').length;

        // Fetch financial data
        const paymentsResp = await api.financial.getPayments();
        const totalRevenue = (paymentsResp.results || []).reduce((sum, p) => sum + (p.amount || 0), 0);

        // Fetch commercial space data
        const unitsResp = await api.commercialSpace.getUnits();
        const units = unitsResp.results || [];
        const occupied = units.filter(u => u.status === 'occupied').length;
        const occupancyRate = units.length ? Math.round((occupied / units.length) * 100) : 0;

        // Fetch compliance data
        const compResp = await api.compliance.getDocuments({ status: 'pending' });
        const pendingCompliance = (compResp.results || []).length;

        // Fetch appointment data
        const apptResp = await api.schedule.getAppointments({ status: 'scheduled' });
        const scheduledAppointments = (apptResp.results || []).length;

        // Update stats state
        setStats({
          totalUsers, totalTenants, totalStaff, totalRevenue, occupancyRate, pendingCompliance, scheduledAppointments
        });

        // Fetch revenue analytics for chart
        const revenue = await api.financial.getRevenueAnalytics({ period: 'month' });
        setRevenueData(revenue.data || []);

        // Get upcoming appointments (first 3)
        setAppointments((apptResp.results || []).slice(0, 3));

        // Get unread notifications
        const notifResp = await api.notifications.getNotifications({ read: false });
        setNotifications(notifResp.results || []);
      } catch (e) {
        // Silently ignore errors for now (UI will show empty states)
      }
    };
    load();
  }, [user, navigate]);

  // Navigation handlers for cards
  const handleTotalUsersClick = () => {
    navigate('/admin/users');
  };

  const handleMonthlyRevenueClick = () => {
    navigate('/admin/financial');
  };

  const handleOccupancyRateClick = () => {
    navigate('/admin/commercial-space');
  };

  const handlePendingItemsClick = () => {
    navigate('/admin/compliance');
  };

  return (
    <Layout role="admin">
      <div className="space-y-8">
        {/* Header section with welcome message */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.firstName}! Here's your system overview.
          </p>
        </div>

        {/* Stats cards grid - each card shows a key metric */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleTotalUsersClick}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalTenants} tenants, {stats.totalStaff} staff
              </p>
            </CardContent>
          </Card>

          {/* Monthly Revenue Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleMonthlyRevenueClick}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          {/* Occupancy Rate Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleOccupancyRateClick}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Occupancy Rate
              </CardTitle>
              <Building className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
              <p className="text-xs text-gray-500 mt-1">
                28 of 33 units occupied
              </p>
            </CardContent>
          </Card>

          {/* Pending Items Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handlePendingItemsClick}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Items
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCompliance}</div>
              <p className="text-xs text-gray-500 mt-1">
                Compliance documents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main content grid - Revenue chart and appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart - takes 2/3 of the grid */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Upcoming Appointments - takes 1/3 of the grid */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Next 3 scheduled appointments</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/schedule')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => navigate('/admin/schedule')}
                  >
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{appointment.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {appointment.date} at {appointment.time}
                      </p>
                    </div>
                    <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Notifications section */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>System Notifications</CardTitle>
                <CardDescription>Recent alerts and updates</CardDescription>
              </div>
              <Badge variant="destructive" className="rounded-full">
                {notifications.filter(n => !n.read).length}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => {
                      // Navigate to relevant section based on notification type
                      if (notification.type === 'success') {
                        navigate('/admin/financial');
                      } else if (notification.type === 'warning') {
                        navigate('/admin/compliance');
                      } else {
                        navigate('/admin/operations');
                      }
                    }}
                  >
                    {/* Different icons for different notification types */}
                    {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                    {notification.type === 'warning' && <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />}
                    {notification.type === 'info' && <Clock className="h-5 w-5 text-blue-600 mt-0.5" />}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}