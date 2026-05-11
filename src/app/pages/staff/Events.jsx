import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar.jsx';
import { Search, Plus, Eye, Pencil, Trash2, MoreVertical, Calendar, Clock, MapPin, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu.jsx';
import connection from '../../connected/connection.js';

const STATUS_OPTIONS = ['scheduled', 'in_progress', 'completed', 'cancelled'];

const STATUS_LABELS = {
  scheduled: 'Pending',
  in_progress: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const statusBadgeClass = {
  scheduled: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  in_progress: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  completed: 'bg-green-100 text-green-700 hover:bg-green-200',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-200',
};

const normalizeAppointment = (a) => ({
  ...a,
  id: a.id,
  title: a.title || 'Untitled Event',
  date: a.date || '',
  time: a.time || '',
  location: a.location || '',
  status: a.status || 'scheduled',
  assignedTo: a.assignedTo || a.assignee_name || 'Unassigned',
  tenantId: a.tenantId || a.tenant_id || null,
});

export function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    assignedTo: '',
    status: 'scheduled',
  });

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

  const getInitials = (name) => {
    if (!name || name === 'Unassigned') return 'U';
    const parts = String(name).split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '?';
    const b = parts[1]?.[0] ?? '';
    return (a + b).toUpperCase();
  };

  const getAssigneeId = (val) => {
    if (!val) return '';
    if (typeof val === 'object' && val.id) return String(val.id);
    return String(val);
  };

  useEffect(() => {
    if (user?.role !== 'staff' && user?.role !== 'admin') {
      navigate('/');
      return;
    }

    const load = async () => {
      try {
        const [resp, usersResp] = await Promise.all([
          connection.events.getAppointments(),
          connection.users.getUsers(),
        ]);
        const list = (Array.isArray(resp) ? resp : (resp?.results || []))
          .map(normalizeAppointment)
          .sort((a, b) => {
            const dateCompare = (b.date || '').localeCompare(a.date || '');
            if (dateCompare !== 0) return dateCompare;
            return (b.time || '').localeCompare(a.time || '', undefined, { numeric: true });
          });
        setAppointments(list);

        const usersList = Array.isArray(usersResp) ? usersResp : (usersResp?.results || []);
        setStaffUsers(usersList);
      } catch (error) {
        setResultTitle('Failed to Load Events Data');
        setResultMessage(error?.message || 'Please try refreshing this page.');
        setIsResultDialogOpen(true);
      }
    };
    load();
  }, [user, navigate]);

  // Date range helpers
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - diff);
    return d;
  };

  const getEndOfWeek = (date) => {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const getStartOfMonth = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getEndOfMonth = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const today = new Date();
    const start = dateFilter === 'today'
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
      : dateFilter === 'this_week'
        ? getStartOfWeek(today)
        : dateFilter === 'this_month'
          ? getStartOfMonth(today)
          : null;
    const end = dateFilter === 'today'
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
      : dateFilter === 'this_week'
        ? getEndOfWeek(today)
        : dateFilter === 'this_month'
          ? getEndOfMonth(today)
          : null;

    return appointments.filter((a) => {
      const matchesQuery = !q || (
        String(a.id).toLowerCase().includes(q) ||
        (a.title || '').toLowerCase().includes(q) ||
        (a.location || '').toLowerCase().includes(q) ||
        (a.assignedTo || '').toLowerCase().includes(q)
      );
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      
      let matchesDate = true;
      if (start && end && a.date) {
        const aptDate = new Date(a.date);
        if (!isNaN(aptDate.getTime())) {
          matchesDate = aptDate.getTime() >= start.getTime() && aptDate.getTime() <= end.getTime();
        }
      }
      
      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const thisWeekStart = getStartOfWeek(new Date()).getTime();
    const thisWeekEnd = getEndOfWeek(new Date()).getTime();
    return {
      total: appointments.length,
      today: appointments.filter((a) => (a.date || '').slice(0, 10) === todayKey).length,
      thisWeek: appointments.filter((a) => {
        const ms = new Date(a.date)?.getTime();
        return ms && ms >= thisWeekStart && ms <= thisWeekEnd;
      }).length,
      scheduled: appointments.filter((a) => a.status === 'scheduled').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
    };
  }, [appointments]);

  const openCreateDialog = () => {
    setFormData({ title: '', date: '', time: '', location: '', assignedTo: '', status: 'scheduled' });
    setIsEditMode(false);
    setEditingId(null);
    setIsCreateDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.title.trim() || !formData.date || !formData.time) {
      setResultTitle('Validation Error');
      setResultMessage('Please provide title, date, and time.');
      setIsResultDialogOpen(true);
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
        status: formData.status,
        tenant_id: formData.assignedTo ? Number(formData.assignedTo) : null,
      };

      if (isEditMode && editingId) {
        const updated = normalizeAppointment(await connection.events.updateAppointment(editingId, payload));
        setAppointments((prev) => prev.map((a) => (String(a.id) === String(editingId) ? updated : a)));
        setResultTitle('Update Successful');
        setResultMessage('The event has been updated.');
      } else {
        const created = normalizeAppointment(await connection.events.createAppointment(payload));
        setAppointments((prev) => [created, ...prev]);
        setResultTitle('Event Created');
        setResultMessage('A new event has been scheduled.');
      }

      setIsCreateDialogOpen(false);
      setIsEditMode(false);
      setEditingId(null);
      setFormData({ title: '', date: '', time: '', location: '', assignedTo: '', status: 'scheduled' });
      setIsResultDialogOpen(true);
    } catch (error) {
      setResultTitle('Failed Saving Event');
      setResultMessage(error?.message || 'Please try again.');
      setIsResultDialogOpen(true);
    }
  };

  const handleEditClick = (appointment) => {
    setFormData({
      title: appointment.title || '',
      date: appointment.date || '',
      time: appointment.time || '',
      location: appointment.location || '',
      assignedTo: getAssigneeId(appointment.tenantId),
      status: appointment.status || 'scheduled',
    });
    setEditingId(appointment.id);
    setIsEditMode(true);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await connection.events.deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => String(a.id) !== String(id)));
      setResultTitle('Delete Successful');
      setResultMessage('The event has been deleted.');
      setIsResultDialogOpen(true);
    } catch (error) {
      setResultTitle('Failed to Delete');
      setResultMessage(error?.message || 'Error deleting event.');
      setIsResultDialogOpen(true);
    }
  };

  const handleUpdateStatus = async (appointment, nextStatus) => {
    try {
      const updated = normalizeAppointment(await connection.events.updateAppointment(String(appointment.id), { status: nextStatus }));
      setAppointments((prev) => prev.map((a) => (String(a.id) === String(appointment.id) ? updated : a)));
    } catch (error) {
      setResultTitle('Status Update Failed');
      setResultMessage(error?.message || 'Unable to update event status.');
      setIsResultDialogOpen(true);
    }
  };

  return (
    <Layout role={user?.role}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2E3192]">Events Management</h1>
            <p className="text-gray-600 mt-1">Schedule, manage, and track all property events and appointments.</p>
          </div>
          <Button className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Total Events</p><p className="text-2xl font-bold text-[#2E3192]">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Today</p><p className="text-2xl font-bold text-[#2E3192]">{stats.today}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">This Week</p><p className="text-2xl font-bold text-blue-700">{stats.thisWeek}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-700">{stats.scheduled}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Completed</p><p className="text-2xl font-bold text-green-700">{stats.completed}</p></CardContent></Card>
        </div>

        <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
          <CardHeader>
            <CardTitle className="text-[#2E3192]">Filters</CardTitle>
            <CardDescription>Search by event ID, title, location, or assignee.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s] || s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="border-gray-200"><SelectValue placeholder="Filter by date range" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[#2E3192]">Events ({filteredAppointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#2E3192] font-semibold">Event Details</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Date & Time</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Location</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Assigned To</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Status</TableHead>
                    <TableHead className="text-right text-[#2E3192] font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-[#F9E81B]/5">
                      <TableCell>
                        <p className="font-medium text-[#2E3192]">{appointment.title}</p>
                        <p className="text-xs text-gray-500">Event ID: {appointment.id}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(appointment.date)}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {appointment.time || 'TBD'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> {appointment.location || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px] bg-[#2E3192]/10 text-[#2E3192] font-semibold">
                              {getInitials(appointment.assignedTo)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{appointment.assignedTo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClass[appointment.status] || statusBadgeClass.scheduled}>
                          {STATUS_LABELS[appointment.status] || appointment.status || STATUS_LABELS.scheduled}
                        </Badge>
                      </TableCell>
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
                                setSelectedAppointment(appointment);
                                setIsDetailsDialogOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4 text-[#2E3192]" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(appointment)} className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4 text-[#2E3192]" />
                              <span>Update Event</span>
                            </DropdownMenuItem>
                            {STATUS_OPTIONS.map((status) => (
                              <DropdownMenuItem
                                key={`${appointment.id}-${status}`}
                                onClick={() => handleUpdateStatus(appointment, status)}
                                className="cursor-pointer"
                              >
                                Mark as {STATUS_LABELS[status] || status}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem onClick={() => handleDeleteEvent(appointment.id)} className="cursor-pointer text-[#ED1C24] focus:text-[#ED1C24] focus:bg-[#ED1C24]/10">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Event</span>
                            </DropdownMenuItem>
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

        {/* Create/Edit Event Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">{isEditMode ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>{isEditMode ? 'Update event details and assignment.' : 'Schedule a new event or appointment.'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Event Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Unit Inspection, Maintenance Visit"
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Time *</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Unit A-101, Clubhouse, Pool Area"
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Assign To</Label>
                  <Select 
                    value={formData.assignedTo || 'unassigned'} 
                    onValueChange={(value) => setFormData({ ...formData, assignedTo: value === 'unassigned' ? '' : value })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {staffUsers.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {getDisplayName(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s] || s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="border-gray-300" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold" onClick={handleSaveEvent}>
                {isEditMode ? 'Update Event' : 'Create Event'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Event Details</DialogTitle>
              <DialogDescription>Full event information for tracking and management.</DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-3 text-sm">
                <p><span className="font-semibold text-[#2E3192]">Event ID:</span> {selectedAppointment.id}</p>
                <p><span className="font-semibold text-[#2E3192]">Title:</span> {selectedAppointment.title}</p>
                <p><span className="font-semibold text-[#2E3192]">Date:</span> {formatDate(selectedAppointment.date)}</p>
                <p><span className="font-semibold text-[#2E3192]">Time:</span> {selectedAppointment.time || 'TBD'}</p>
                <p><span className="font-semibold text-[#2E3192]">Location:</span> {selectedAppointment.location || '-'}</p>
                <p><span className="font-semibold text-[#2E3192]">Status:</span> {STATUS_LABELS[selectedAppointment.status] || selectedAppointment.status}</p>
                <p><span className="font-semibold text-[#2E3192]">Assigned To:</span> {selectedAppointment.assignedTo || 'Unassigned'}</p>
              </div>
            )}
            <DialogFooter>
              <Button className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Result Dialog */}
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