import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Search, Plus, Pencil, Trash2, MoreVertical, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu.jsx';
import connection from '../../connected/connection.js';

const STATUS_OPTIONS = ['pending', 'in_progress', 'completed', 'cancelled'];
const TYPE_OPTIONS = ['Technical', 'Electrical', 'Plumbing', 'Billing', 'Security', 'Other'];

const statusBadgeClass = {
  pending: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  in_progress: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  completed: 'bg-green-100 text-green-700 hover:bg-green-200',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-200',
};

const normalizeRequest = (r) => ({
  ...r,
  id: r.id,
  title: r.title || 'Untitled Request',
  description: r.description || '',
  type: r.type || r.request_type || 'Technical',
  status: r.status || 'pending',
  createdAt: r.createdAt || r.created_at || '',
  assignedTo: r.assignedTo || 'Unassigned',
  tenantName: r.tenantName || 'Unknown Tenant',
  tenant: r.tenant || null,
  assignedToId: r.assigned_to || null,
});

export function Compliance() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    type: 'Technical',
    description: '',
    assignedTo: '',
  });
  const [staffUsers, setStaffUsers] = useState([]);
  const refreshTimerRef = useRef(null);

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch {
      return String(d).split('T')[0] || '-';
    }
  };

  const getDisplayName = (u) => {
    const full = `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.trim();
    return full || u.email || `User #${u.id}`;
  };

  const getAssigneeId = (val) => {
    if (!val) return '';
    if (typeof val === 'object' && val.id) return String(val.id);
    return String(val);
  };

  useEffect(() => {
    if (user?.role !== 'staff') {
      navigate('/');
      return;
    }

    const loadUsersOnce = async () => {
      try {
        const usersResp = await connection.users.getUsers();
        const usersList = Array.isArray(usersResp) ? usersResp : (usersResp?.results || []);
        setStaffUsers(usersList.filter((u) => (u.role || '').toLowerCase() === 'staff'));
      } catch (error) {
        setResultTitle('Failed to Load Compliance Data');
        setResultMessage(error?.message || 'Please try refreshing this page.');
        setIsResultDialogOpen(true);
      }
    };

    const refreshRequests = async ({ silent = false } = {}) => {
      try {
        const resp = await connection.compliance.getRequests();
        const list = (Array.isArray(resp) ? resp : (resp?.results || []))
          .map(normalizeRequest)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setRequests(list);
      } catch (error) {
        if (!silent) {
          setResultTitle('Failed to Load Compliance Data');
          setResultMessage(error?.message || 'Please try refreshing this page.');
          setIsResultDialogOpen(true);
        } else {
          console.warn('Compliance auto-refresh failed:', error);
        }
      }
    };

    loadUsersOnce();
    refreshRequests({ silent: false });

    refreshTimerRef.current = window.setInterval(() => {
      refreshRequests({ silent: true });
    }, 5000);

    return () => {
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [user, navigate]);

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesQuery = !q || (
        String(r.id).toLowerCase().includes(q) ||
        (r.title || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.type || '').toLowerCase().includes(q) ||
        (r.assignedTo || '').toLowerCase().includes(q)
      );
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesType = typeFilter === 'all' || (r.type || 'Technical') === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [requests, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    inProgress: requests.filter((r) => r.status === 'in_progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    cancelled: requests.filter((r) => r.status === 'cancelled').length,
  }), [requests]);

  const openCreateDialog = () => {
    setFormData({ title: '', type: 'Technical', description: '', assignedTo: '' });
    setIsEditMode(false);
    setEditingId(null);
    setIsCreateDialogOpen(true);
  };

  const handleSaveRequest = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setResultTitle('Validation Error');
      setResultMessage('Please provide both title and description.');
      setIsResultDialogOpen(true);
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        assigned_to: formData.assignedTo && formData.assignedTo !== 'none' ? Number(formData.assignedTo) : null,
      };

      if (isEditMode && editingId) {
        const updated = normalizeRequest(await connection.compliance.updateRequest(editingId, payload));
        setRequests((prev) => prev.map((r) => (String(r.id) === String(editingId) ? updated : r)));
        setResultTitle('Update Successful');
        setResultMessage('The request has been updated and assigned.');
      } else {
        const created = normalizeRequest(await connection.compliance.createRequest({ ...payload, status: 'pending' }));
        setRequests((prev) => [created, ...prev]);
        setResultTitle('Request Created');
        setResultMessage('A new compliance request has been submitted.');
      }

      setIsCreateDialogOpen(false);
      setIsEditMode(false);
      setEditingId(null);
      setFormData({ title: '', type: 'Technical', description: '', assignedTo: '' });
      setIsResultDialogOpen(true);
    } catch (error) {
      setResultTitle('Failed Saving Request');
      setResultMessage(error?.message || 'Please try again.');
      setIsResultDialogOpen(true);
    }
  };

  const handleEditClick = (request) => {
    setFormData({
      title: request.title || '',
      type: request.type || 'Technical',
      description: request.description || '',
      assignedTo: getAssigneeId(request.assignedToId || request.assigned_to),
    });
    setEditingId(request.id);
    setIsEditMode(true);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await connection.compliance.deleteRequest(id);
      setRequests((prev) => prev.filter((r) => String(r.id) !== String(id)));
      setResultTitle('Delete Successful');
      setResultMessage('The request has been deleted.');
      setIsResultDialogOpen(true);
    } catch (error) {
      setResultTitle('Failed to Delete');
      setResultMessage(error?.message || 'Error deleting request.');
      setIsResultDialogOpen(true);
    }
  };

  const handleUpdateStatus = async (request, nextStatus) => {
    try {
      const updated = normalizeRequest(await connection.compliance.updateRequest(String(request.id), { status: nextStatus }));
      setRequests((prev) => prev.map((r) => (String(r.id) === String(request.id) ? updated : r)));
    } catch (error) {
      setResultTitle('Status Update Failed');
      setResultMessage(error?.message || 'Unable to update request status.');
      setIsResultDialogOpen(true);
    }
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2E3192]">Compliance Management</h1>
            <p className="text-gray-600 mt-1">Monitor and resolve your assigned operational compliance requests.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold text-[#2E3192]">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-700">{stats.pending}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">In Progress</p><p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Completed</p><p className="text-2xl font-bold text-green-700">{stats.completed}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Cancelled</p><p className="text-2xl font-bold text-red-700">{stats.cancelled}</p></CardContent></Card>
        </div>

        <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
          <CardHeader>
            <CardTitle className="text-[#2E3192]">Filters</CardTitle>
            <CardDescription>Search by request ID, title, type, description, or assignee.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="border-gray-200"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[#2E3192]">Operation Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#2E3192] font-semibold">Request</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Type</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Description</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Tenant</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Assigned To</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Status</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Created</TableHead>
                    <TableHead className="text-right text-[#2E3192] font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-[#F9E81B]/5">
                      <TableCell>
                        <p className="font-medium text-[#2E3192]">{request.title}</p>
                        <p className="text-xs text-gray-500">Request ID: {request.id}</p>
                      </TableCell>
                      <TableCell className="text-sm">{request.type}</TableCell>
                      <TableCell className="text-sm max-w-[280px] truncate">{request.description || '-'}</TableCell>
                      <TableCell className="text-sm">{request.tenantName || 'Unknown'}</TableCell>
                      <TableCell className="text-sm">{request.assignedTo || 'Unassigned'}</TableCell>
                      <TableCell>
                        <Badge className={`${statusBadgeClass[request.status] || statusBadgeClass.pending} capitalize`}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(request.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4 text-[#2E3192]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[190px]">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsDetailsDialogOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4 text-[#2E3192]" />
                              <span>View Details</span>
                            </DropdownMenuItem>

                            {/* Only allow actions if the request is assigned to the current user */}
                            {String(request.assignedToId) === String(user?.id) ? (
                              <>
                                {STATUS_OPTIONS.map((status) => (
                                  <DropdownMenuItem
                                    key={`${request.id}-${status}`}
                                    onClick={() => handleUpdateStatus(request, status)}
                                    className="cursor-pointer capitalize"
                                  >
                                    Mark as {status.replace('_', ' ')}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            ) : (
                              <div className="px-2 py-1.5 text-xs text-gray-500 italic">
                                Only assigned staff can take action
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">{isEditMode ? 'Edit Operation Request' : 'Create Operation Request'}</DialogTitle>
              <DialogDescription>{isEditMode ? 'Update request details and assignment.' : 'Submit a detailed operational compliance request.'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Title</Label>
                <Input
                  value={formData.title}
                  disabled
                  className="bg-gray-50 border-gray-200 cursor-not-allowed text-black disabled:opacity-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Assign to Staff</Label>
                <Select
                  value={formData.assignedTo || "none"}
                  onValueChange={(val) => setFormData({ ...formData, assignedTo: val === "none" ? "" : val })}
                >
                  <SelectTrigger className="border-gray-200 focus:ring-[#F9E81B]">
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {staffUsers.filter(u => u.role === 'staff' || u.role === 'admin').map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {getDisplayName(u)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Description</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md min-h-[80px] text-sm text-black">
                  {formData.description || 'No description provided.'}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="border-gray-300" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold" onClick={handleSaveRequest}>
                {isEditMode ? 'Update Request' : 'Create Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Request Details</DialogTitle>
              <DialogDescription>Full request information for compliance tracking.</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-3 text-sm">
                <p><span className="font-semibold text-[#2E3192]">Request ID:</span> {selectedRequest.id}</p>
                <p><span className="font-semibold text-[#2E3192]">Title:</span> {selectedRequest.title}</p>
                <p><span className="font-semibold text-[#2E3192]">Type:</span> {selectedRequest.type}</p>
                <p><span className="font-semibold text-[#2E3192]">Status:</span> <span className="capitalize">{selectedRequest.status.replace('_', ' ')}</span></p>
                <p><span className="font-semibold text-[#2E3192]">Assigned To:</span> {selectedRequest.assignedTo || 'Unassigned'}</p>
                <p><span className="font-semibold text-[#2E3192]">Created:</span> {formatDate(selectedRequest.createdAt)}</p>
                <div>
                  <p className="font-semibold text-[#2E3192]">Description:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.description || '-'}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
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
              <Button className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold" onClick={() => setIsResultDialogOpen(false)}>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}