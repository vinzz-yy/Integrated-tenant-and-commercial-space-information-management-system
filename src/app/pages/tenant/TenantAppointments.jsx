import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Calendar } from '../../components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import api from '../../services/api.js';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { toast } from 'sonner';

export function TenantAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ date: '', time: '', purpose: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'tenant') navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const resp = await api.schedule.getAppointments({ tenant_id: user?.id });
        setAppointments(resp.results || []);
      } catch (err) {
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleBookAppointment = async () => {
    if (!formData.date || !formData.time || !formData.purpose) {
      toast.warning('Please complete all fields');
      return;
    }
    try {
      const created = await api.schedule.createAppointment({
        date: formData.date,
        time: formData.time,
        title: formData.purpose,
        tenant_id: user?.id,
        status: 'scheduled',
      });
      setAppointments([...appointments, created]);
      toast.success('Appointment booked');
      setIsBookDialogOpen(false);
      setFormData({ date: '', time: '', purpose: '' });
    } catch (err) {
      toast.error('Failed to book appointment');
    }
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
                {loading ? (
                  <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : appointments.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="font-medium">No upcoming appointments</p>
                  </div>
                ) : (
                  appointments.map((appt) => (
                    <div key={appt.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{appt.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{appt.date} at {appt.time}</p>
                        <p className="text-sm text-gray-500 mt-1">Location: {appt.location}</p>
                      </div>
                    </div>
                  ))
                )}
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
