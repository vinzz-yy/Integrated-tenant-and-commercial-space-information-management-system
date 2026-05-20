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
import { Search, Trash2, MoreVertical, Eye, Calendar, MapPin, Clock, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu.jsx';
import connection from '../../connected/connection.js';

const STATUS_OPTIONS = ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'rejected'];
const STATUS_LABELS = {
  pending: 'Pending Approval',
  scheduled: 'Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

const statusBadgeClass = {
  pending: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  scheduled: 'bg-green-100 text-green-700 hover:bg-green-200',
  in_progress: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  completed: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-200',
  rejected: 'bg-red-200 text-red-800 hover:bg-red-300',
};

const normalizeEvent = (e) => ({
  ...e,
  id: e.id,
  title: e.title || e.category || 'Untitled Event',
  category: e.category || e.title || 'General',
  date: e.date || '',
  time: e.time || '',
  location: e.location || '',
  status: e.status || 'scheduled',
  assignedTo: e.assignedTo || 'Unassigned',
  assignedToId: e.assignedToId || e.assigned_to || null,
  tenantName: e.tenantName || 'Unknown',
  tenantId: e.tenantId || e.tenant || null,
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
  const [staffUsers, setStaffUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    date: '',
    time: '',
    location: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'General',
      date: '',
      time: '',
      location: '',
    });
  };

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      setResultTitle('Missing Required Fields');
      setResultMessage('Please fill in Title, Date, and Time.');
      setIsResultDialogOpen(true);
      return;
    }
    try {
      const payload = { 
        ...formData,
        tenant_id: null, // Always a community event
        status: 'scheduled', // Automatically approved for admin
      };
      
      const created = await connection.events.createAppointment(payload);
      setEvents((prev) => [normalizeEvent(created), ...prev]);
      setIsCreateDialogOpen(false);
      resetForm();
      setResultTitle('Success');
      setResultMessage('Event created successfully.');
      setIsResultDialogOpen(true);
    } catch (error) {
      setResultTitle('Error');
      setResultMessage(error?.message || 'Failed to create event.');
      setIsResultDialogOpen(true);
    }
  };

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
        const [resp, usersResp, unitsResp] = await Promise.all([
          connection.events.getAppointments(),
          connection.users.getUsers(),
          connection.commercialSpace.getUnits(),
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
        setStaffUsers(usersList);
        
        const unitsList = Array.isArray(unitsResp) ? unitsResp : (unitsResp?.results || []);
        setUnits(unitsList);
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
      pending: events.filter((e) => e.status === 'pending').length,
      approved: events.filter((e) => e.status === 'scheduled').length,
      completed: events.filter((e) => e.status === 'completed').length,
    };
  }, [events]);

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
            <h1 className="text-3xl font-bold text-[#2E3192]">Events Management</h1>
            <p className="text-gray-600 mt-1">Schedule, assign, and manage community events.</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Total Events</p><p className="text-2xl font-bold text-[#2E3192]">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Today</p><p className="text-2xl font-bold text-[#2E3192]">{stats.today}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">This Week</p><p className="text-2xl font-bold text-blue-700">{stats.thisWeek}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Pending Approval</p><p className="text-2xl font-bold text-yellow-700">{stats.pending}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Approved</p><p className="text-2xl font-bold text-green-700">{stats.approved}</p></CardContent></Card>
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
                    <TableHead className="text-[#2E3192] font-semibold">Event Details</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Date & Time</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Location</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Tenant</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Assigned To</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Status</TableHead>
                    <TableHead className="text-right text-[#2E3192] font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-[#F9E81B]/5">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#2E3192]">{event.category}</span>
                          <span className="text-[10px] text-gray-400">ID: {event.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(event.date)}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {event.time || 'TBD'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location || '-'}</span>
                      </TableCell>
                      <TableCell className="text-sm">{event.tenantName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[#2E3192]/10 flex items-center justify-center text-[#2E3192] text-[10px] font-bold">
                            {event.assignedTo === 'Unassigned' ? 'U' : event.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <span className="text-sm">{event.assignedTo}</span>
                        </div>
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

        {/* Create Event Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Create New Event</DialogTitle>
              <DialogDescription>Fill in the details for the new event.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Community Meeting"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input 
                    id="time" 
                    type="time" 
                    value={formData.time} 
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. Community Hall"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({...formData, category: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button 
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                onClick={handleCreateEvent}
              >
                Create Event
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