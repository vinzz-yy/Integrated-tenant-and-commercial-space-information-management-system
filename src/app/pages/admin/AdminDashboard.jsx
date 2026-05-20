import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Button } from '../../components/ui/button.jsx';
import connection from '../../connected/connection.js';
import { 
  Users, 
  PhilippinePeso, 
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Activity,
  Calendar,
  ClipboardList
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function AdminDashboard() {
  // Get current user from auth context and navigation hook
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // State for storing dashboard statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTenants: 0,
    totalStaff: 0,
    totalRevenue: 0,
    unpaidAmount: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
    scheduledEvents: 0,
    revenueGrowth: 0,
  });

  // State for chart data and lists
  const [revenueData, setRevenueData] = useState([]);
  const [events, setEvents] = useState([]);
  const [complianceRequests, setComplianceRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Load all dashboard data when component mounts
  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // Redirect non-admin users
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const loadDashboardData = async () => {
      try {
        // Fetch all data in parallel for better performance
        const [
          usersResp,
          paymentsResp,
          docsResp,
          compResp,
          eventResp,
          revenueResp,
          notifResp
        ] = await Promise.allSettled([
          connection.users.getUsers(),
          connection.financial.getPayments(),
          connection.documents.getDocuments(), // Fetch all documents
          connection.compliance.getRequests(),
          connection.events.getAppointments({ status: 'scheduled' }),
          connection.financial.getRevenueAnalytics({ period: '6months' }),
          connection.notifications.getNotifications({ read: false, limit: 5 })
        ]);

        // Process users data
        if (usersResp.status === 'fulfilled') {
          const usersData = usersResp.value;
          const users = Array.isArray(usersData) ? usersData : (usersData?.results || []);
          const totalUsers = usersData?.count || users.length;
          const totalTenants = users.filter(u => u.role === 'tenant').length;
          const totalStaff = users.filter(u => u.role === 'staff').length;

          setStats(prev => ({
            ...prev,
            totalUsers,
            totalTenants,
            totalStaff
          }));
        }

        // Process financial statistics
        if (paymentsResp.status === 'fulfilled') {
          const paymentsData = paymentsResp.value;
          const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.results || []);
          const totalRevenue = payments.filter(p => p.status === 'completed' || p.status === 'paid').reduce((sum, p) => sum + Number(p.amount || 0), 0);
          const unpaidAmount = payments.filter(p => p.status === 'unpaid' || p.status === 'pending').reduce((sum, p) => sum + Number(p.amount || 0), 0);
          
          // Calculate revenue growth (compare last month with previous month)
          const sortedPayments = [...payments].sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at));
          const currentMonth = new Date().getMonth();
          const lastMonthPayments = sortedPayments.filter(p => {
            const d = new Date(p.payment_date || p.created_at);
            return !isNaN(d) && d.getMonth() === currentMonth;
          });
          const previousMonthPayments = sortedPayments.filter(p => {
            const d = new Date(p.payment_date || p.created_at);
            return !isNaN(d) && d.getMonth() === (currentMonth - 1 < 0 ? 11 : currentMonth - 1);
          });
          
          const lastMonthTotal = lastMonthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
          const previousMonthTotal = previousMonthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
          
          const revenueGrowth = previousMonthTotal ? 
            ((lastMonthTotal - previousMonthTotal) / previousMonthTotal * 100).toFixed(1) : 0;

          setStats(prev => ({
            ...prev,
            totalRevenue,
            unpaidAmount,
            revenueGrowth
          }));
        }

        // Process revenue analytics
        if (revenueResp.status === 'fulfilled') {
          const revenueDataValue = revenueResp.value;
          const revenueChartData = revenueDataValue?.data || (Array.isArray(revenueDataValue) ? revenueDataValue : []);
          
          if (revenueChartData && revenueChartData.length > 0) {
            // Map keys if necessary
            const normalizedData = revenueChartData.map(item => ({
              month: item.month || item.name || 'N/A',
              revenue: Number(item.revenue || 0),
              unpaid: Number(item.unpaid || 0)
            }));
            setRevenueData(normalizedData);
          }
        } else if (paymentsResp.status === 'fulfilled') {
          // Fallback to generating from payments if the analytics endpoint fails
          const paymentsData = paymentsResp.value;
          const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.results || []);
          
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const generatedRevenueData = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const targetMonth = d.getMonth();
            const targetYear = d.getFullYear();
            
            const monthPayments = payments.filter(p => {
              const pDate = new Date(p.payment_date || p.created_at);
              return !isNaN(pDate) && pDate.getMonth() === targetMonth && pDate.getFullYear() === targetYear;
            });
            
            const monthRevenue = monthPayments
              .filter(p => p.status === 'completed' || p.status === 'paid')
              .reduce((sum, p) => sum + Number(p.amount || 0), 0);
            
            const monthUnpaid = monthPayments
              .filter(p => p.status === 'unpaid' || p.status === 'pending')
              .reduce((sum, p) => sum + Number(p.amount || 0), 0);
            
            generatedRevenueData.push({
              month: monthNames[targetMonth],
              revenue: monthRevenue,
              unpaid: monthUnpaid
            });
          }
          setRevenueData(generatedRevenueData);
        }

        // Process documents data
        if (docsResp.status === 'fulfilled') {
          const docsData = docsResp.value;
          const allDocs = Array.isArray(docsData) ? docsData : (docsData?.results || []);
          
          setStats(prev => ({
            ...prev,
            totalDocuments: allDocs.length,
            pendingDocuments: allDocs.filter(d => d.status === 'pending').length
          }));
        }

        // Process compliance data
        if (compResp.status === 'fulfilled') {
          const compData = compResp.value;
          const rawReqs = Array.isArray(compData) ? compData : (compData?.results || []);
          
          // Get recent compliance requests (newest 3)
          const sortedCompliance = [...rawReqs]
            .sort((a, b) => b.id - a.id)
            .slice(0, 3);
          setComplianceRequests(sortedCompliance);
        }

        // Process event data
        if (eventResp.status === 'fulfilled') {
          const eventData = eventResp.value;
          const eventsDataList = Array.isArray(eventData) ? eventData : (eventData?.results || []);
          setStats(prev => ({
            ...prev,
            scheduledEvents: eventsDataList.length
          }));
          
          // Get upcoming events (next 3 newest)
          const sortedEvents = [...eventsDataList]
            .sort((a, b) => b.id - a.id)
            .slice(0, 3);
          setEvents(sortedEvents);
        }

        // Process notifications
        if (notifResp.status === 'fulfilled') {
          const notifData = notifResp.value;
          const notificationsData = Array.isArray(notifData) ? notifData : (notifData?.results || []);
          setNotifications(notificationsData);
        }

      } catch (e) {
        console.error('Error loading dashboard data:', e);
        // Silently fail - UI will show empty states
      }
    };
    
    loadDashboardData();
  }, [user, navigate, loading]);

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E3192]"></div>
        </div>
      </Layout>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatEventDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-PH', options);
  };
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'scheduled': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-8">
        {/* Header section with welcome message */}
        <div>
          <h1 className="text-3xl font-bold text-[#2E3192]">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, admin! Here's your system overview.
          </p>
        </div>

        {/* Stats cards grid - each card shows a key metric */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#F9E81B] border-2 border-transparent" onClick={() => navigate('/admin/users')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-[#2E3192]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">{stats.totalUsers}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalTenants} tenants, {stats.totalStaff} staff
              </p>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors cursor-pointer" onClick={() => navigate('/admin/financial')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Total Revenue
                <PhilippinePeso className="h-4 w-4 text-[#2E3192]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">{formatCurrency(stats.totalRevenue)}</div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${Number(stats.revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-3 w-3 ${Number(stats.revenueGrowth) < 0 ? 'rotate-180' : ''}`} />
                {stats.revenueGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          {/* Unpaid Amount Card */}
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors cursor-pointer" onClick={() => navigate('/admin/financial')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Unpaid Amount
                <AlertCircle className="h-4 w-4 text-[#ED1C24]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#ED1C24]">{formatCurrency(stats.unpaidAmount)}</div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                Unpaid 
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>

          {/* Total Documents Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#F9E81B] border-2 border-transparent" onClick={() => navigate('/admin/Documents')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
               Total Documents
              </CardTitle>
              <AlertCircle className={`h-4 w-4 ${stats.pendingDocuments > 0 ? 'text-[#ED1C24]' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">{stats.totalDocuments}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.pendingDocuments} pending approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main content grid - Revenue chart and events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart - takes 2/3 of the grid */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-[#2E3192]">Revenue Overview</CardTitle>
              <CardDescription>Total revenue vs Unpaid amount (last 6 months)</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `₱${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend verticalAlign="top" height={36} align="right" iconType="circle" />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2E3192" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#2E3192', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name="Total Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="unpaid" 
                      stroke="#ED1C24" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#ED1C24', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name="Unpaid Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No analytics data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events - takes 1/3 of the grid */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#2E3192]">Upcoming Events</CardTitle>
                <CardDescription>
                  {stats.scheduledEvents} scheduled events
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/Events')}
                className="border-gray-300 hover:bg-[#F9E81B]/10 hover:text-[#2E3192]"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div 
                      key={event.id} 
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-[#F9E81B]/5 transition-colors"
                    >
                      <Calendar className="h-5 w-5 text-[#2E3192] mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-medium text-sm truncate">{event.category || event.title}</p>
                          <Badge variant="outline" className={`text-[10px] py-0 h-4 ${getStatusColor(event.status)}`}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatEventDate(event.date)} at {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No upcoming events
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Compliance Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#2E3192]">Compliance Requests</CardTitle>
                <CardDescription>
                  Recent operation requests
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/Compliance')}
                className="border-gray-300 hover:bg-[#F9E81B]/10 hover:text-[#2E3192]"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {complianceRequests.length > 0 ? (
                <div className="space-y-4">
                  {complianceRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-[#F9E81B]/5 transition-colors"
                    >
                      <ClipboardList className="h-5 w-5 text-[#2E3192] mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-medium text-sm truncate">{request.title}</p>
                          <Badge variant="outline" className={`text-[10px] py-0 h-4 ${getStatusColor(request.status)}`}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          From: {request.tenantName || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent requests
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}