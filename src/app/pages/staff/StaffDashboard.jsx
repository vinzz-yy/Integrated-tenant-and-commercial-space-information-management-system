import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Calendar, ClipboardList, ArrowRight, PhilippinePeso, Users, Building, FileText } from 'lucide-react';
import connection from '../../connected/connection.js';

export function StaffDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // State for storing staff's events and requests
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [unpaidAmount, setUnpaidAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [totalTenants, setTotalTenants] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);

  // Load staff data when component mounts
  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // Redirect if not staff
    if (!user || user.role !== 'staff') {
      navigate('/');
      return;
    }
    
    const load = async () => {
      try {
        // Fetch events, requests, payments, users, units, and documents in parallel
        // For staff, we want to see events and requests where they are the assignee
        const [eventResp, reqs, payResult, usersResult, unitsResult, docsResult] = await Promise.all([
          connection.events.getAppointments(), // Fetch all so we can filter by assigned_to
          connection.compliance.getRequests(), // Fetch all so we can filter by assigned_to
          connection.financial.getPayments(),
          connection.users.getUsers({ role: 'tenant' }),
          connection.commercialSpace.getUnits(),
          connection.documents.getDocuments()
        ]);
        
        const rawEvents = Array.isArray(eventResp) ? eventResp : (eventResp?.results || []);
        // Filter events assigned to this staff member
        const eventList = rawEvents.filter(e => String(e.assigned_to) === String(user?.id) || String(e.assignedToId) === String(user?.id));
        setEvents(eventList);
        
        const rawReqs = Array.isArray(reqs) ? reqs : (reqs?.results || []);
        // Filter requests assigned to this staff member
        const reqList = rawReqs.filter(r => String(r.assigned_to) === String(user?.id) || String(r.assignedToId) === String(user?.id));
        setRequests(reqList);

        const payments = Array.isArray(payResult) ? payResult : (payResult?.results || []);
        
        const unpaid = payments
          .filter(p => p.status === 'unpaid' || p.status === 'pending')
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        setUnpaidAmount(unpaid);

        const paid = payments
          .filter(p => p.status === 'paid' || p.status === 'completed')
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        setPaidAmount(paid);

        const tenants = Array.isArray(usersResult) ? usersResult : (usersResult?.results || []);
        setTotalTenants(tenants.length);

        const units = Array.isArray(unitsResult) ? unitsResult : (unitsResult?.results || []);
        setTotalUnits(units.length);

        const docs = Array.isArray(docsResult) ? docsResult : (docsResult?.results || []);
        setTotalDocuments(docs.length);
      } catch (e) {
        console.error("Error loading dashboard data:", e);
        setEvents([]); 
        setRequests([]);
        setUnpaidAmount(0);
        setPaidAmount(0);
        setTotalTenants(0);
        setTotalUnits(0);
        setTotalDocuments(0);
      }
    };
    load();
  }, [user, navigate, loading]);

  if (loading) {
    return (
      <Layout role="staff">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E3192]"></div>
        </div>
      </Layout>
    );
  }

  // Calculate pending tasks
  const pendingTasks = requests.filter(req => req.status === 'pending');

  return (
    <Layout role="staff">
      <div className="space-y-8">
        {/* Header with welcome message */}
        <div>
          <h1 className="text-3xl font-bold text-[#2E3192]">
            Staff Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName}! Here's your work overview.
          </p>
        </div>

        {/* Stats cards grid - each card shows a key metric */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Total Tenant Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#F9E81B] border-2 border-transparent" onClick={() => navigate('/staff/users')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Total Tenant
                <Users className="h-4 w-4 text-[#2E3192]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">{totalTenants}</div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                registered tenants
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>

          {/* Total Commercial Space Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#F9E81B] border-2 border-transparent" onClick={() => navigate('/staff/commercial-space')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Total Commercial Space
                <Building className="h-4 w-4 text-[#F9E81B]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">{totalUnits}</div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                commercial units
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>

          {/* Total Documents Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#F9E81B] border-2 border-transparent" onClick={() => navigate('/staff/Documents')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Total Documents
                <FileText className="h-4 w-4 text-[#2E3192]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">{totalDocuments}</div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                documents
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>

          {/* Total Paid Amount Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#F9E81B] border-2 border-transparent" onClick={() => navigate('/staff/financial')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Total Paid Amount
                <PhilippinePeso className="h-4 w-4 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">₱{paidAmount.toLocaleString('en-PH')}</div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
               Paid
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>

          {/* Unpaid Amount Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#F9E81B] border-2 border-transparent" onClick={() => navigate('/staff/financial')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Unpaid
                <PhilippinePeso className="h-4 w-4 text-[#ED1C24]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#ED1C24]">₱{unpaidAmount.toLocaleString('en-PH')}</div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                Unpaid payments
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main content grid - Events and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Events section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#2E3192]">My Events</CardTitle>
                <CardDescription>Your upcoming events</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/staff/Events')} className="gap-1 text-[#2E3192] hover:text-[#2E3192] hover:bg-[#F9E81B]/20">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-[#F9E81B]/10 transition-colors"
                    onClick={() => navigate('/staff/Events')}
                  >
                    <Calendar className="h-5 w-5 text-[#F9E81B] mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.category || event.title || 'Untitled Event'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.date} at {event.time}
                      </p>
                      <Badge className="mt-2 bg-[#2E3192] text-white">
                        Scheduled
                      </Badge>
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
                <CardTitle className="text-[#2E3192]">Assigned Tasks</CardTitle>
                <CardDescription>Operation requests assigned to you</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/staff/Compliance')} className="gap-1 text-[#2E3192] hover:text-[#2E3192] hover:bg-[#F9E81B]/20">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-[#F9E81B]/10 transition-colors"
                    onClick={() => navigate('/staff/Compliance')}
                  >
                    <ClipboardList className="h-5 w-5 text-[#2E3192] mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{request.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Priority: {request.priority} • Status: {request.status}
                      </p>
                      <Badge
                        className={`mt-2 ${request.status === 'completed' ? 'bg-[#2E3192] text-white' : request.status === 'pending' ? 'bg-[#ED1C24] text-white' : 'bg-[#F9E81B]/30 text-[#2E3192]'}`}
                      >
                        {request.status?.replace('_', ' ')}
                      </Badge>
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