import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
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
    totalUsers: 45,
    totalTenants: 28,
    totalStaff: 12,
    totalRevenue: 128000,
    occupancyRate: 85,
    pendingCompliance: 5,
    scheduledAppointments: 12,
  });

  // Mock data for revenue chart
  const revenueData = [
    { month: 'Jan', revenue: 120000, expenses: 80000 },
    { month: 'Feb', revenue: 125000, expenses: 82000 },
    { month: 'Mar', revenue: 130000, expenses: 85000 },
    { month: 'Apr', revenue: 128000, expenses: 83000 },
    { month: 'May', revenue: 135000, expenses: 88000 },
    { month: 'Jun', revenue: 142000, expenses: 90000 },
  ];

  // Mock data for upcoming appointments
  const appointments = [
    {
      id: 1,
      title: 'Unit Inspection - A-105',
      date: '2026-03-05',
      time: '10:00 AM',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Lease Renewal Meeting',
      date: '2026-03-08',
      time: '2:00 PM',
      status: 'scheduled'
    },
    {
      id: 3,
      title: 'Maintenance Review',
      date: '2026-03-10',
      time: '9:00 AM',
      status: 'scheduled'
    }
  ];

  // Mock data for notifications
  const notifications = [
    {
      id: 1,
      title: 'New Payment Received',
      message: 'Payment of $2,500 received from John Tenant',
      type: 'success',
      read: false
    },
    {
      id: 2,
      title: 'Document Expiring Soon',
      message: 'Fire Safety Certificate for Unit A-105 expires in 30 days',
      type: 'warning',
      read: false
    },
    {
      id: 3,
      title: 'Maintenance Request Submitted',
      message: 'New maintenance request from Sarah Jones – Unit B-202',
      type: 'info',
      read: false
    }
  ];

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Navigation handlers for stat cards
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.firstName}! Here's your system overview.
          </p>
        </div>

        {/* Stats Grid - Now clickable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card - Clickable */}
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

          {/* Monthly Revenue Card - Clickable */}
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

          {/* Occupancy Rate Card - Clickable */}
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

          {/* Pending Items Card - Clickable */}
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

        {/* Chart and Upcoming Appointments Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart - Takes 2/3 of the space */}
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

          {/* Upcoming Appointments - Takes 1/3 of the space */}
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

        {/* System Notifications - Full Width Below */}
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
                      // Navigate to appropriate page based on notification type
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