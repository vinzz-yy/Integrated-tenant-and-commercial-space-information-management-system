import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { ClipboardList, Clock, CheckCircle, Activity } from 'lucide-react';
import connection from '../../connected/connection.js';

export function Compliance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return String(d).split('T')[0] || '';
    }
  };

  useEffect(() => {
    if (user?.role !== 'staff') navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    const load = async () => {
      const data = await connection.compliance.getRequests();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setRequests(list);
    };
    load();
  }, []);

  // Brand-color priority badge
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-[#ED1C24] text-white hover:bg-[#ED1C24]/90';
      case 'medium':
        return 'bg-[#F9E81B]/30 text-[#2E3192] hover:bg-[#F9E81B]/40';
      case 'low':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Brand-color status badge
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-[#2E3192] text-white hover:bg-[#2E3192]/90';
      case 'in_progress':
        return 'bg-[#F9E81B]/30 text-[#2E3192] hover:bg-[#F9E81B]/40';
      case 'pending':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'cancelled':
        return 'bg-[#ED1C24]/10 text-[#ED1C24] hover:bg-[#ED1C24]/20';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#2E3192]">Compliance Management</h1>
          <p className="text-gray-600 mt-1">View and manage assigned compliance requests</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Total Requests
                <ClipboardList className="h-4 w-4 text-[#2E3192]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">{requests.length}</div>
              <p className="text-xs text-gray-500 mt-1">All requests</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Pending
                <Clock className="h-4 w-4 text-[#F9E81B]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Completed
                <CheckCircle className="h-4 w-4 text-[#2E3192]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">
                {requests.filter(r => r.status === 'completed').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Resolved requests</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                In Progress
                <Activity className="h-4 w-4 text-[#F9E81B]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">
                {requests.filter(r => r.status === 'in_progress').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[#2E3192]">My Assigned Requests ({requests.length})</CardTitle>
            <CardDescription>All compliance requests assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#2E3192] font-semibold">Title</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Type</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Priority</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Status</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <ClipboardList className="h-10 w-10 mx-auto mb-3 text-[#2E3192]/30" />
                        <p className="text-sm text-gray-500">No requests found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-[#F9E81B]/5">
                        <TableCell className="font-medium text-[#2E3192]">{req.title}</TableCell>
                        <TableCell className="text-sm">{req.type || req.request_type}</TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${getPriorityColor(req.priority)}`}>
                            {req.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={req.status || 'pending'}
                            onValueChange={async (value) => {
                              try {
                                const updated = await connection.compliance.updateRequest(String(req.id), { status: value });
                                setRequests(requests.map(r => String(r.id) === String(req.id) ? updated : r));
                              } catch (e) {}
                            }}
                          >
                            <SelectTrigger className="border-gray-200 h-8 text-sm w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{formatDate(req.createdAt || req.created_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}