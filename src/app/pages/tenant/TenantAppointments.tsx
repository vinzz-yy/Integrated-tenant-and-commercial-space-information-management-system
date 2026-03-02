import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Calendar } from '../../components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { mockAppointments } from '../../services/mockData';

// DJANGO BACKEND INTEGRATION POINT
// Tenant Appointments APIs:
// - GET /api/schedule/appointments/?tenant_id={user.id} - Get tenant's appointments
// - POST /api/schedule/appointments/ - Book new appointment

export function TenantAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments] = useState(mockAppointments);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ date: '', time: '', purpose: '' });

  useEffect(() => {
    if (user?.role !== 'tenant') navigate('/');
  }, [user, navigate]);

  const handleBookAppointment = () => {
    // DJANGO BACKEND INTEGRATION POINT
    // API Call: POST /api/schedule/appointments/
    toast.success('Appointment booked successfully');
    setIsBookDialogOpen(false);
  };

  return (
    <Layout role="tenant">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <Button onClick={() => setIsBookDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle>Calendar</CardTitle></CardHeader>
            <CardContent>
              <Calendar mode="single" className="rounded-md border" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div key={appt.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{appt.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{appt.date} at {appt.time}</p>
                      <p className="text-sm text-gray-500 mt-1">Location: {appt.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Appointment</DialogTitle>
              <DialogDescription>Schedule a new appointment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Textarea value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleBookAppointment}>Book</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
