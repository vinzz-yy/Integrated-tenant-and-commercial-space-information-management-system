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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar.jsx';
import { Search, Eye, Calendar, Info } from 'lucide-react';
import connection from '../../connected/connection.js';

export function TenantAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState([]);

  const [activeTab, setActiveTab] = useState('appointments');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const getInitials = (value) => {
    const str = String(value || '').trim();
    if (!str) return '?';
    const parts = str.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '?';
    const b = parts[1]?.[0] ?? '';
    return (a + b).toUpperCase();
  };

  const parseDateOnly = (dateStr) => {
    if (!dateStr) return null;
    const normalized = String(dateStr).slice(0, 10);
    const [y, m, d] = normalized.split('-').map((v) => Number(v));
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

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

  const statusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'scheduled':
        return 'Approved';
      case 'in_progress':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      default:
        return status || 'Pending';
    }
  };

  const statusVariant = (status) => {
    switch (status) {
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      case 'completed':
        return 'outline';
      case 'in_progress':
      case 'scheduled':
        return 'default';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-[#F9E81B]/30 text-[#2E3192]';
      case 'scheduled':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-[#2E3192]/10 text-[#2E3192]';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
      case 'rejected':
        return 'bg-[#ED1C24]/10 text-[#ED1C24]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredAppointments = useMemo(() => {
    const today = new Date();
    const start =
      dateFilter === 'today'
        ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
        : dateFilter === 'this_week'
          ? getStartOfWeek(today)
          : dateFilter === 'this_month'
            ? getStartOfMonth(today)
            : null;
    const end =
      dateFilter === 'today'
        ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
        : dateFilter === 'this_week'
          ? getEndOfWeek(today)
          : dateFilter === 'this_month'
            ? getEndOfMonth(today)
            : null;

    const query = searchQuery.trim().toLowerCase();

    return appointments
      .filter((apt) => {
        if (!apt) return false;
        
        // Filter by tab
        if (activeTab === 'appointments') {
          // Personal tab: Only show items assigned to this tenant
          if (String(apt.tenant) !== String(user?.id)) return false;
        } else if (activeTab === 'community') {
          // Community tab: Show all approved items (scheduled, in_progress, completed)
          if (!['scheduled', 'in_progress', 'completed'].includes(apt.status)) return false;
        }

        if (statusFilter !== 'all' && String(apt.status || 'pending') !== statusFilter) return false;
        if (start && end) {
          const aptDate = parseDateOnly(apt.date);
          if (!aptDate) return false;
          const ms = aptDate.getTime();
          if (ms < start.getTime() || ms > end.getTime()) return false;
        }
        if (query) {
          const hay = [apt.title, apt.location, apt.assignedTo, apt.date, apt.time, apt.status]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!hay.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const da = parseDateOnly(a.date)?.getTime() ?? 0;
        const db = parseDateOnly(b.date)?.getTime() ?? 0;
        if (da !== db) return db - da;
        return String(b.time || '').localeCompare(String(a.time || ''), undefined, { numeric: true });
      });
  }, [appointments, searchQuery, dateFilter, statusFilter, activeTab, user?.id]);

  // Load appointments when component mounts
  useEffect(() => {
    // Redirect if user is not tenant
    if (user?.role !== 'tenant') {
      navigate('/');
      return;
    }
    
    // Async function to fetch appointments from API
    const load = async () => {
      try {
        const resp = await connection.events.getAppointments();
        const list = Array.isArray(resp) ? resp : (resp?.results || []);
        setAppointments(list);
      } catch (e) {
        // Set empty array on error to prevent undefined issues
        setAppointments([]);
      }
    };
    load();
  }, [user, navigate]);

  const openViewDialog = (apt) => {
    setSelectedAppointment(apt);
    setIsViewDialogOpen(true);
  };
  
  return (
    <Layout role="tenant">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#2E3192]">Events & Schedules</h1>
            <p className="text-gray-600 mt-1">
              View your upcoming appointments and community events.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-gray-100/50 p-1">
            <TabsTrigger 
              value="appointments"
              className="data-[state=active]:bg-white data-[state=active]:text-[#2E3192] data-[state=active]:shadow-sm"
            >
              My Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="community"
              className="data-[state=active]:bg-white data-[state=active]:text-[#2E3192] data-[state=active]:shadow-sm"
            >
              Community Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-[#2E3192]">Personal Appointments</CardTitle>
                <CardDescription>
                  {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search appointments..."
                      className="pl-10 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-full sm:w-[170px] border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Date: All</SelectItem>
                        <SelectItem value="today">Date: Today</SelectItem>
                        <SelectItem value="this_week">Date: This Week</SelectItem>
                        <SelectItem value="this_month">Date: This Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[140px] border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Status: All</SelectItem>
                        <SelectItem value="pending">Pending Approval</SelectItem>
                        <SelectItem value="scheduled">Approved</SelectItem>
                        <SelectItem value="in_progress">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border border-gray-200 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-[#2E3192] font-semibold">Time / Date</TableHead>
                        <TableHead className="text-[#2E3192] font-semibold">Title / Location</TableHead>
                        <TableHead className="text-[#2E3192] font-semibold">Assigned To</TableHead>
                        <TableHead className="text-[#2E3192] font-semibold">Status</TableHead>
                        <TableHead className="text-right text-[#2E3192] font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-12 text-center">
                            <Calendar className="h-10 w-10 mx-auto mb-3 text-[#2E3192]/30" />
                            <p className="text-sm text-gray-500">No appointments match your filters.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAppointments.map((apt) => {
                          const assigned = apt.assignedTo || 'Unassigned';
                          return (
                            <TableRow key={apt.id} className="hover:bg-[#F9E81B]/5">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-[#2E3192]">{apt.time || '-'}</span>
                                  <span className="text-xs text-gray-500">{apt.date || '-'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{apt.title || '-'}</span>
                                  <span className="text-xs text-gray-500">{apt.location || ''}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7 border border-[#F9E81B]">
                                    <AvatarImage src={apt.assigneeAvatar || ''} alt={assigned} />
                                    <AvatarFallback className="text-[10px] bg-[#2E3192] text-white">{getInitials(assigned)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{assigned}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {activeTab === 'appointments' ? (
                                  <Badge
                                    variant={statusVariant(apt.status)}
                                    className={getStatusColor(apt.status)}
                                  >
                                    {statusLabel(apt.status)}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-gray-400">Community</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openViewDialog(apt)}
                                  className="h-8 px-2 text-[#2E3192] hover:bg-[#F9E81B]/20"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-[#2E3192]">Community Events</CardTitle>
                <CardDescription>
                  Upcoming community-wide events and activities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search community events..."
                      className="pl-10 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                    />
                  </div>
                </div>

                <div className="rounded-md border border-gray-200 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-[#2E3192] font-semibold">Time / Date</TableHead>
                        <TableHead className="text-[#2E3192] font-semibold">Event / Location</TableHead>
                        <TableHead className="text-right text-[#2E3192] font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="py-12 text-center">
                            <Calendar className="h-10 w-10 mx-auto mb-3 text-[#2E3192]/30" />
                            <p className="text-sm text-gray-500">No community events at the moment.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAppointments.map((apt) => {
                          return (
                            <TableRow key={apt.id} className="hover:bg-[#F9E81B]/5">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-[#2E3192]">{apt.time || '-'}</span>
                                  <span className="text-xs text-gray-500">{apt.date || '-'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{apt.title || '-'}</span>
                                  <span className="text-xs text-gray-500">{apt.location || ''}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openViewDialog(apt)}
                                  className="h-8 px-2 text-[#2E3192] hover:bg-[#F9E81B]/20"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Dialog */}
        <Dialog
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) setSelectedAppointment(null);
          }}
        >
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Appointment Details</DialogTitle>
              <DialogDescription>View appointment information.</DialogDescription>
            </DialogHeader>
            {selectedAppointment ? (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label className="text-gray-500">Title</Label>
                  <Input value={selectedAppointment.title || ''} readOnly className="bg-gray-50/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-500">Date</Label>
                    <Input value={selectedAppointment.date || ''} readOnly className="bg-gray-50/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Time</Label>
                    <Input value={selectedAppointment.time || ''} readOnly className="bg-gray-50/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">Location</Label>
                  <Input value={selectedAppointment.location || ''} readOnly className="bg-gray-50/50" />
                </div>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-gray-300">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}