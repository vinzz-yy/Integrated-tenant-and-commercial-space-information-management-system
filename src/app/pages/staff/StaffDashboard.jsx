import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Calendar, ClipboardList } from 'lucide-react';
import connection from '../../connected/connection.js';

export function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing staff's appointments and requests
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);

  // Load staff data when component mounts
  useEffect(() => {
    // Redirect if not staff
    if (user?.role !== 'staff') {
      navigate('/');
      return;
    }
    
    const load = async () => {
      try {
        // Fetch appointments and requests in parallel
        const appts = await connection.schedule.getAppointments({ tenant_id: user?.id });
        const apptList = Array.isArray(appts) ? appts : (appts?.results || []);
        setAppointments(apptList);
        
        const reqs = await connection.operations.getRequests({ tenant_id: user?.id });
        const reqList = Array.isArray(reqs) ? reqs : (reqs?.results || []);
        setRequests(reqList);
      } catch (e) {
        // Set empty arrays on error
        setAppointments([]); 
        setRequests([]);
      }
    };
    load();
  }, [user, navigate]);

  return (
    <Layout role="staff">
      <div className="space-y-8">
        {/* Header with welcome message */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Staff Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName}! Here's your work overview.
          </p>
        </div>

        {/* Stats cards grid - each card shows a key metric */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* My Tasks Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                My Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
              <p className="text-xs text-gray-500 mt-1">assigned to you</p>
            </CardContent>
          </Card>

          {/* Appointments Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-gray-500 mt-1">view schedule</p>
            </CardContent>
          </Card>

          {/* Pending Reviews Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500 mt-1">Compliance documents</p>
            </CardContent>
          </Card>

          {/* Active Requests Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
              <p className="text-xs text-gray-500 mt-1">Operation requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Main content grid - Appointments and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Appointments section */}
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
                {appointments.slice(0, 3).map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg"
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

          {/* Assigned Tasks section */}
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
                {requests.slice(0, 3).map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg"
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