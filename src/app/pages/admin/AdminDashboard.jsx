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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTenants: 0,
    totalStaff: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    pendingCompliance: 0,
    scheduledAppointments: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    const load = async () => {
      try {
        const usersResp = await api.users.getUsers();
        const totalUsers = usersResp.count || (usersResp.results?.length || 0);
        const totalTenants = (usersResp.results || []).filter(u => u.role === 'tenant').length;
        const totalStaff = (usersResp.results || []).filter(u => u.role === 'staff').length;

        const paymentsResp = await api.financial.getPayments();
        const totalRevenue = (paymentsResp.results || []).reduce((sum, p) => sum + (p.amount || 0), 0);

        const unitsResp = await api.commercialSpace.getUnits();
        const units = unitsResp.results || [];
        const occupied = units.filter(u => u.status === 'occupied').length;
        const occupancyRate = units.length ? Math.round((occupied / units.length) * 100) : 0;

        const compResp = await api.compliance.getDocuments({ status: 'pending' });
        const pendingCompliance = (compResp.results || []).length;

        const apptResp = await api.schedule.getAppointments({ status: 'scheduled' });
        const scheduledAppointments = (apptResp.results || []).length;

        setStats({
          totalUsers, totalTenants, totalStaff, totalRevenue, occupancyRate, pendingCompliance, scheduledAppointments
        });

        const revenue = await api.financial.getRevenueAnalytics({ period: 'month' });
        setRevenueData(revenue.data || []);

        setAppointments((apptResp.results || []).slice(0, 3));

        const notifResp = await api.notifications.getNotifications({ read: false });
        setNotifications(notifResp.results || []);
      } catch (e) {
        // ignore errors for now
      }
    };
    load();
  }, [user, navigate]);

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.firstName}! Here's your system overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      if (notification.type === 'success') {
                        navigate('/admin/financial');
                      } else if (notification.type === 'warning') {
                        navigate('/admin/compliance');
                      } else {
                        navigate('/admin/operations');
                      }
                    }}
                  >
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
