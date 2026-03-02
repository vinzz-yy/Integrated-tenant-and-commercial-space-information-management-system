import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, ClipboardList, FileCheck, Wrench } from 'lucide-react';
import { mockAppointments, mockOperationRequests } from '../../services/mockData';

// DJANGO BACKEND INTEGRATION POINT
// Staff Dashboard APIs:
// - GET /api/dashboard/staff-stats/ - Get staff-specific dashboard stats
// - GET /api/schedule/appointments/?assigned_to={user.id} - Get assigned appointments
// - GET /api/operations/requests/?assigned_to={user.id} - Get assigned tasks

export function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'staff') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Navigation handlers for stat cards
  const handleMyTasksClick = () => {
    navigate('/staff/operations');
  };

  const handleAppointmentsTodayClick = () => {
    navigate('/staff/schedule');
  };

  const handlePendingReviewsClick = () => {
    navigate('/staff/compliance');
  };

  const handleActiveRequestsClick = () => {
    navigate('/staff/operations');
  };

  return (
    <Layout role="staff">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Staff Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.firstName}! Here's your work overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* My Tasks Card - Clickable */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleMyTasksClick}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                My Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500 mt-1">5 pending, 7 completed</p>
            </CardContent>
          </Card>

          {/* Appointments Today Card - Clickable */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleAppointmentsTodayClick}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Appointments Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-gray-500 mt-1">view schedule</p>
            </CardContent>
          </Card>

          {/* Pending Reviews Card - Clickable */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handlePendingReviewsClick}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-gray-500 mt-1">Compliance documents</p>
            </CardContent>
          </Card>

          {/* Active Requests Card - Clickable */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleActiveRequestsClick}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-gray-500 mt-1">Operation requests</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Appointments Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Appointments</CardTitle>
                <CardDescription>Your upcoming appointments</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/staff/schedule')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAppointments.slice(0, 3).map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => navigate('/staff/schedule')}
                  >
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{appointment.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {appointment.date} at {appointment.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Tasks Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assigned Tasks</CardTitle>
                <CardDescription>Operation requests assigned to you</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/staff/operations')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOperationRequests.slice(0, 3).map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => navigate('/staff/operations')}
                  >
                    <ClipboardList className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{request.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Priority: {request.priority} • Status: {request.status}
                      </p>
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