// ScheduleManagement.jsx - Admin schedule management page
// Allows administrators to view, create, and manage appointments and schedules

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
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
import { Plus, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api.js';

export function ScheduleManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing appointments data
  const [appointments, setAppointments] = useState([]);
  
  // State for calendar selection
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Dialog state for creating new appointments
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for new appointment
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '1 hour',
    type: 'meeting',
    location: '',
  });

  // Load appointments when component mounts
  useEffect(() => {
    // Redirect if user is not an admin
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    
    // Async function to fetch appointments from API
    const load = async () => {
      try {
        const resp = await api.schedule.getAppointments();
        setAppointments(resp.results || []);
      } catch (e) {
        // Set empty array on error to prevent undefined issues
        setAppointments([]);
      }
    };
    load();
  }, [user, navigate]);

  // Handle creating a new appointment
  const handleCreateAppointment = async () => {
    try {
      // Send request to create appointment
      const created = await api.schedule.createAppointment(formData);
      
      // Add new appointment to the list
      setAppointments([...appointments, created]);
      
      // Close the dialog
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment. Please try again.');
    }
  };

  // Handle deleting an appointment
  const handleDeleteAppointment = async (id) => {
    try {
      // Send delete request to API
      await api.schedule.deleteAppointment(String(id));
      
      // Remove deleted appointment from state
      setAppointments(appointments.filter(a => String(a.id) !== String(id)));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment. Please try again.');
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header section with title and create button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Schedule Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage appointments and schedules
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Main grid - Calendar and Appointments list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar card - takes 1/3 of the grid */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
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

          {/* Appointments list card - takes 2/3 of the grid */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Upcoming appointments and meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Map through appointments and display each one */}
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    {/* Date icon/visual representation */}
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex flex-col items-center justify-center">
                      <CalendarIcon className="h-6 w-6 text-blue-600" />
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
                      <Badge variant="outline" className="mt-2">
                        {appointment.type}
                      </Badge>
                    </div>
                    
                    {/* Action buttons (Edit and Delete) */}
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Appointment Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Appointment</DialogTitle>
              <DialogDescription>Schedule a new appointment</DialogDescription>
            </DialogHeader>
            
            {/* Form fields */}
            <div className="space-y-4">
              {/* Title input */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Appointment title"
                />
              </div>
              
              {/* Date and time inputs (2-column grid) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Type select dropdown */}
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Meeting location"
                />
              </div>
            </div>
            
            {/* Dialog footer with action buttons */}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAppointment}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}