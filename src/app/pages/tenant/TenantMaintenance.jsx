import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Plus, Wrench } from 'lucide-react';
import connection from '../../connected/connection.js';

export function TenantMaintenance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for maintenance requests
  const [requests, setRequests] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for new request
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    file: null,
  });

  // Redirect if not tenant
  useEffect(() => {
    if (user?.role !== 'tenant') navigate('/');
  }, [user, navigate]);

  // Load tenant's maintenance requests
  useEffect(() => {
    const load = async () => {
      const resp = await connection.maintenance.getRequests({ tenant_id: user?.id });
      setRequests(resp.results || []);
    };
    load();
  }, [user]);

  // Handle submitting a new maintenance request
  const handleSubmitRequest = async () => {
    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('priority', formData.priority);
      data.append('tenant_id', String(user?.id || ''));
      if (formData.file) data.append('file', formData.file);
      
      await connection.maintenance.createRequest(data);
      setIsCreateDialogOpen(false);
      
      // Refresh requests list
      const resp = await connection.maintenance.getRequests({ tenant_id: user?.id });
      setRequests(resp.results || []);
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      alert('Failed to submit maintenance request. Please try again.');
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
      case 'completed': return 'default'; // Blue badge
      case 'in_progress': return 'secondary'; // Gray badge
      case 'pending': return 'outline'; // Outlined badge
      default: return 'outline';
    }
  };

  return (
    <Layout role="tenant">
      <div className="space-y-6">
        {/* Header with create button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Requests</h1>
            <p className="text-gray-600 mt-1">
              Submit and track maintenance requests for Unit {user?.unitNumber}
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Stats cards showing request overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {requests.filter(r => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests list */}
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>All your maintenance requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Wrench className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{request.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-500">
                          Created: {request.createdAt}
                        </p>
                        {request.assignedTo && (
                          <p className="text-xs text-gray-500">
                            Assigned to: {request.assignedTo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={getPriorityColor(request.priority)}>
                      {request.priority} priority
                    </Badge>
                    <Badge variant={getStatusColor(request.status)}>
                      {(request.status || '').replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
              {requests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No maintenance requests yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Request Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Maintenance Request</DialogTitle>
              <DialogDescription>
                Describe the issue you're experiencing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Title input */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue"
                />
              </div>
              
              {/* Priority select */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High - Urgent</SelectItem>
                    <SelectItem value="medium">Medium - Normal</SelectItem>
                    <SelectItem value="low">Low - Can Wait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Description textarea */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about the issue..."
                  rows={4}
                />
              </div>
              
              {/* File attachment */}
              <div className="space-y-2">
                <Label>Attachment (Optional)</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                />
                <p className="text-xs text-gray-500">Upload photos or documents (max 5MB)</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRequest}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}