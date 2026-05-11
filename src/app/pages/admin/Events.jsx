// Events.jsx - Admin events management page with consistent styling
// Refactored to match Compliance Management UI patterns

import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, Search, Pencil, Trash2, MoreVertical, Eye, Calendar, MapPin, Clock, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu.jsx';
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

const normalizeEvent = (e) => ({
  ...e,
  id: e.id,
  title: e.title || 'Untitled Event',
  date: e.date || '',
  time: e.time || '',
  location: e.location || '',
  status: e.status || 'scheduled',
  assignedTo: e.assignedTo || e.tenant?.name || e.tenant?.email || 'Unassigned',
  tenant: e.tenant || null,
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
  if (!u) return '';
  const full = `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.trim();
  return full || u.email || `User #${u.id}`;
};

export function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
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
  });
  const [staffUsers, setStaffUsers] = useState([]);

  // Date filter helpers
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

  const parseDateOnly = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = String(dateStr).split('-').map((v) => Number(v));
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
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
          .map(normalizeEvent)
          .sort((a, b) => {
            const dateCompare = (b.date || '').localeCompare(a.date || '');
            if (dateCompare !== 0) return dateCompare;
            return (b.time || '').localeCompare(a.time || '');
          });
        setEvents(list);

        const usersList = Array.isArray(usersResp) ? usersResp : (usersResp?.results || []);
        setStaffUsers(usersList.filter((u) => (u.role || '').toLowerCase() === 'staff'));
      } catch (error) {
        setResultTitle('Failed to Load Events Data');
        setResultMessage(error?.message || 'Please try refreshing this page.');
        setIsResultDialogOpen(true);
      }
    };
    load();
  }, [user, navigate]);

  const filteredEvents = useMemo(() => {
    const today = new Date();
    const query = searchQuery.trim().toLowerCase();
    
    let start = null;
    let end = null;
    
    if (dateFilter === 'today') {
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    } else if (dateFilter === 'this_week') {
      start = getStartOfWeek(today);
      end = getEndOfWeek(today);
    } else if (dateFilter === 'this_month') {
      start = getStartOfMonth(today);
      end = getEndOfMonth(today);
    }
    
    return events.filter((e) => {
      const matchesQuery = !query || (
        String(e.id).toLowerCase().includes(query) ||
        (e.title || '').toLowerCase().includes(query) ||
        (e.location || '').toLowerCase().includes(query) ||
        (e.assignedTo || '').toLowerCase().includes(query)
      );
      
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      
      let matchesDate = true;
      if (start && end && e.date) {
        const eventDate = parseDateOnly(e.date);
        if (eventDate) {
          const ms = eventDate.getTime();
          matchesDate = ms >= start.getTime() && ms <= end.getTime();
        }
      }
      
      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [events, searchQuery, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const thisWeekStart = getStartOfWeek(new Date()).getTime();
    const thisWeekEnd = getEndOfWeek(new Date()).getTime();
    
    return {
      total: events.length,
      today: events.filter((e) => String(e.date || '').slice(0, 10) === todayKey).length,
      thisWeek: events.filter((e) => {
        const ms = parseDateOnly(e.date)?.getTime();
        return ms && ms >= thisWeekStart && ms <= thisWeekEnd;
      }).length,
      pending: events.filter((e) => e.status === 'scheduled').length,
      completed: events.filter((e) => e.status === 'completed').length,
    };
  }, [events]);

  const openCreateDialog = () => {
    setFormData({ title: '', date: '', time: '', location: '', assignedTo: '' });
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
        tenant_id: formData.assignedTo ? Number(formData.assignedTo) : null,
      };

      if (isEditMode && editingId) {
        const updated = normalizeEvent(await connection.events.updateAppointment(editingId, payload));
        setEvents((prev) => prev.map((e) => (String(e.id) === String(editingId) ? updated : e)));
        setResultTitle('Update Successful');
        setResultMessage('The event has been updated.');
      } else {
        const created = normalizeEvent(await connection.events.createAppointment({ ...payload, status: 'scheduled' }));
        setEvents((prev) => [created, ...prev]);
        setResultTitle('Event Created');
        setResultMessage('A new event has been scheduled.');
      }

      setIsCreateDialogOpen(false);
      setIsEditMode(false);
      setEditingId(null);
      setFormData({ title: '', date: '', time: '', location: '', assignedTo: '' });
      setIsResultDialogOpen(true);
    } catch (error) {
      setResultTitle('Failed Saving Event');
      setResultMessage(error?.message || 'Please try again.');
      setIsResultDialogOpen(true);
    }
  };

  const handleEditClick = (event) => {
    setFormData({
      title: event.title || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      assignedTo: event.tenant?.id ? String(event.tenant.id) : '',
    });
    setEditingId(event.id);
    setIsEditMode(true);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await connection.events.deleteAppointment(id);
      setEvents((prev) => prev.filter((e) => String(e.id) !== String(id)));
      setResultTitle('Delete Successful');
      setResultMessage('The event has been deleted.');
      setIsResultDialogOpen(true);
    } catch (error) {
      setResultTitle('Failed to Delete');
      setResultMessage(error?.message || 'Error deleting event.');
      setIsResultDialogOpen(true);
    }
  };

  const handleUpdateStatus = async (event, nextStatus) => {
    try {
      const updated = normalizeEvent(await connection.events.updateAppointment(String(event.id), { status: nextStatus }));
      setEvents((prev) => prev.map((e) => (String(e.id) === String(event.id) ? updated : e)));
    } catch (error) {
      setResultTitle('Status Update Failed');
      setResultMessage(error?.message || 'Unable to update event status.');
      setIsResultDialogOpen(true);
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2E3192]">Event Management</h1>
            <p className="text-gray-600 mt-1">Schedule, assign, and manage community events and appointments.</p>
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
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-700">{stats.pending}</p></CardContent></Card>
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
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
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
            <CardTitle className="text-[#2E3192]">Events ({filteredEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#2E3192] font-semibold">Event</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Date & Time</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Location</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Assigned To</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Status</TableHead>
                    <TableHead className="text-right text-[#2E3192] font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-[#F9E81B]/5">
                      <TableCell>
                        <p className="font-medium text-[#2E3192]">{event.title}</p>
                        <p className="text-xs text-gray-500">Event ID: {event.id}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {formatDate(event.date)}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {event.time || 'TBD'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {event.location || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400" />
                          {event.assignedTo || 'Unassigned'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusBadgeClass[event.status] || statusBadgeClass.scheduled} capitalize`}>
                          {STATUS_LABELS[event.status] || event.status}
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
                                setSelectedEvent(event);
                                setIsDetailsDialogOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4 text-[#2E3192]" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(event)} className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4 text-[#2E3192]" />
                              <span>Update Event</span>
                            </DropdownMenuItem>
                            {STATUS_OPTIONS.map((status) => (
                              <DropdownMenuItem
                                key={`${event.id}-${status}`}
                                onClick={() => handleUpdateStatus(event, status)}
                                className="cursor-pointer capitalize"
                              >
                                Mark as {STATUS_LABELS[status]}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="cursor-pointer text-[#ED1C24] focus:text-[#ED1C24] focus:bg-[#ED1C24]/10">
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
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">{isEditMode ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update event details and assignment.' : 'Schedule a new community event or appointment.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Event Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Community Meeting, Unit Inspection"
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
                  placeholder="e.g., Clubhouse, Unit A-101, Virtual Meeting"
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Assign to Staff</Label>
                <Select 
                  value={formData.assignedTo || 'none'} 
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value === 'none' ? '' : value })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {staffUsers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {getDisplayName(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="border-gray-300" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                onClick={handleSaveEvent}
              >
                {isEditMode ? 'Update Event' : 'Create Event'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Event Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Event Details</DialogTitle>
              <DialogDescription>Full event information for reference.</DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-3 text-sm">
                <p><span className="font-semibold text-[#2E3192]">Event ID:</span> {selectedEvent.id}</p>
                <p><span className="font-semibold text-[#2E3192]">Title:</span> {selectedEvent.title}</p>
                <p><span className="font-semibold text-[#2E3192]">Date:</span> {formatDate(selectedEvent.date)}</p>
                <p><span className="font-semibold text-[#2E3192]">Time:</span> {selectedEvent.time || 'TBD'}</p>
                <p><span className="font-semibold text-[#2E3192]">Location:</span> {selectedEvent.location || '-'}</p>
                <p><span className="font-semibold text-[#2E3192]">Status:</span> <span className="capitalize">{STATUS_LABELS[selectedEvent.status] || selectedEvent.status}</span></p>
                <p><span className="font-semibold text-[#2E3192]">Assigned To:</span> {selectedEvent.assignedTo || 'Unassigned'}</p>
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