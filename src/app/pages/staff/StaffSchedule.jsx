// StaffSchedule.jsx - Staff schedule management page
// Allows staff to view, create, and manage their appointments

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar } from '../../components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Calendar as CalendarIcon, Edit, Trash2, Plus } from 'lucide-react';
import api from '../../services/api.js';

export function StaffSchedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for calendar and appointments
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  
  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for new appointment
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'meeting',
    location: '',
    duration: '1 hour',
  });

  // Redirect if not staff and load appointments
  useEffect(() => {
    if (user?.role !== 'staff') {
      navigate('/');
      return;
    }
    
    const load = async () => {
      const resp = await api.schedule.getAppointments();
      setAppointments(resp.results || []);
    };
    load();
  }, [user, navigate]);

  // Handle creating a new appointment
  const handleCreateAppointment = async () => {
    // Validate required fields
    if (!formData.title || !formData.date || !formData.time) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const created = await api.schedule.createAppointment({ 
        ...formData, 
        status: 'scheduled' 
      });
      setAppointments([...appointments, created]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment. Please try again.');
    }
  };

  // Handle deleting an appointment
  const handleDeleteAppointment = async (id) => {
    try {
      await api.schedule.deleteAppointment(String(id));
      setAppointments(appointments.filter(apt => String(apt.id) !== String(id)));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment. Please try again.');
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      type: 'meeting',
      location: '',
      duration: '1 hour',
    });
  };

  // Filter appointments for selected date
  const filteredAppointments = selectedDate
    ? appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.toDateString() === selectedDate.toDateString();
      })
    : appointments;

  return (
    <Layout role="staff">
      <div className="space-y-6">
        {/* Header with create button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Schedule
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your appointments and meetings
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Main grid - Calendar and Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar card */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Appointments list card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                Appointments {selectedDate && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    for {selectedDate.toLocaleDateString()}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      {/* Date icon */}
                      <div className="flex-shrink-0 w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex flex-col items-center justify-center">
                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600 mt-1">
                          {new Date(appointment.date).toLocaleDateString('en-US', { day: 'numeric' })}
                        </span>
                      </div>
                      
                      {/* Appointment details */}
                      <div className="flex-1">
                        <h3 className="font-semibold">{appointment.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {appointment.date} at {appointment.time}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Duration: {appointment.duration} • Location: {appointment.location}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {appointment.type}
                          </Badge>
                          <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No appointments scheduled for this date
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Appointment Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment or meeting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Title input */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Appointment title"
                />
              </div>
              
              {/* Date and time inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Type select */}
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="viewing">Unit Viewing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Location input */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Meeting location"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAppointment}>Create Appointment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}