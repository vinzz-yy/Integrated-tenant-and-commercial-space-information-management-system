import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Label } from '../../components/ui/label.jsx';
import {Dialog,DialogContent, DialogDescription,DialogFooter, DialogHeader,DialogTitle,} from '../../components/ui/dialog.jsx';
import {Select,SelectContent,SelectItem,SelectTrigger, SelectValue,} from '../../components/ui/select.jsx';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from '../../components/ui/table.jsx';
import { Search, Plus, ClipboardList, Clock, CheckCircle } from 'lucide-react';
import connection from '../../connected/connection.js';

export function Compliance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing operation requests
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  
  // Form state for creating new request
  const [formData, setFormData] = useState({
    title: '',
    type: 'Technical',
    description: '',
    assignedTo: '',
    date: '',
  });
  const [staffUsers, setStaffUsers] = useState([]);
  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return String(d).split('T')[0] || '';
    }
  };

  // Initial load - fetch all operation requests
  useEffect(() => {
    // Redirect if not admin
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const load = async () => {
      const resp = await connection.compliance.getRequests();
      const list = Array.isArray(resp) ? resp : (resp?.results || []);
      setRequests(list);
      setFilteredRequests(list);
      try {
        const usersResp = await connection.users.getUsers();
        const usersList = Array.isArray(usersResp) ? usersResp : (usersResp?.results || []);
        setStaffUsers(usersList.filter(u => (u.role || '').toLowerCase() === 'staff'));
      } catch {}
    };
    load();
  }, [user, navigate]);

  // Filter requests when search query or status filter changes
  useEffect(() => {
    let filtered = requests;
    
    // Apply search filter (search by title)
    if (searchQuery) {
      filtered = filtered.filter(r =>
        (r.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, requests]);

  // Handle creating a new operation request
  const handleCreateRequest = async () => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: 'pending',
        tenant_id: formData.assignedTo ? String(formData.assignedTo) : undefined,
      };
      const created = await connection.compliance.createRequest(payload);
      setRequests([...requests, created]);
      setIsCreateDialogOpen(false);
      setResultTitle('Adding Request Successful');
      setResultMessage('The request has been submitted successfully.');
      setIsResultDialogOpen(true);
    } catch (error) {
      console.error('Error creating request:', error);
      setResultTitle('Failed Adding Request');
      setResultMessage('Failed adding request. Please try again.');
      setIsResultDialogOpen(true);
    }
  };

  // Helper function to determine badge color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive'; // Red badge
      case 'medium': return 'default'; // Blue badge
      case 'low': return 'secondary'; // Gray badge
      default: return 'outline';
    }
  };

  // Helper function to determine badge color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'closed': return 'outline'; // Outlined badge
      case 'in_progress': return 'default'; // Blue badge
      case 'open': return 'secondary'; // Gray badge
      default: return 'outline';
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header with create button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2E3192]">
              Compliance Management
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage operational requests
            </p>
          </div>
          <Button
            className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Stats cards showing request overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Open Requests
                <ClipboardList className="h-4 w-4 text-[#2E3192]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">
                {requests.filter(r => r.status === 'open').length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                In Progress
                <Clock className="h-4 w-4 text-[#F9E81B]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">
                {requests.filter(r => r.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Closed
                <CheckCircle className="h-4 w-4 text-[#2E3192]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'closed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters card */}
        <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
          <CardHeader>
            <CardTitle className="text-[#2E3192]">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search input */}
              <div className="relative">
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              {/* Status filter dropdown */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[#2E3192]">Operation Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#2E3192] font-semibold">Title</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Type</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Status</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Assigned To</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-[#F9E81B]/5">
                      <TableCell className="font-medium text-[#2E3192]">{request.title}</TableCell>
                      <TableCell>{request.type || request.request_type}</TableCell>
                      <TableCell>
                        <Select
                          value={request.status || 'pending'}
                          onValueChange={async (value) => {
                            try {
                              const updated = await connection.compliance.updateRequest(String(request.id), { status: value });
                              setRequests(requests.map(r => String(r.id) === String(request.id) ? updated : r));
                            } catch (e) {}
                          }}
                        >
                          <SelectTrigger className="border-gray-200">
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
                      <TableCell className="text-sm">{request.assignedTo || 'Unassigned'}</TableCell>
                      <TableCell className="text-sm">{formatDate(request.createdAt || request.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Request Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Create Operation Request</DialogTitle>
              <DialogDescription>Submit a new operational request</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Title input */}
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Request title"
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
              {/* Type select */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Administrative">Administrative</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Date and Assigned To */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Assigned To</Label>
                  <Select value={String(formData.assignedTo || '')} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffUsers.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {(s.firstName || s.first_name || '') + ' ' + (s.lastName || s.last_name || '') || s.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Description textarea */}
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the request..."
                  rows={4}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="border-gray-300" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                onClick={handleCreateRequest}
              >
                Create Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">{resultTitle}</DialogTitle>
              <DialogDescription>{resultMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                onClick={() => setIsResultDialogOpen(false)}
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}