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
import { Plus, Wrench, ClipboardList, CheckCircle, Pencil, Trash2, MoreVertical } from 'lucide-react';
import connection from '../../connected/connection.js';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu.jsx';

export function TenantMaintenance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for maintenance requests
  const [requests, setRequests] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
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
      setRequests(Array.isArray(resp) ? resp : (resp?.results || []));
    };
    load();
  }, [user]);

  // Handle submitting an operation request
  const handleSubmitRequest = async () => {
    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('type', formData.priority);
      data.append('tenant_id', String(user?.id || ''));
      if (formData.file) data.append('attachment', formData.file);
      
      if (isEditMode && editingId) {
        await connection.maintenance.updateRequestWithFile(editingId, data);
        toast.success('Maintenance request updated successfully!');
      } else {
        await connection.maintenance.createRequest(data);
        toast.success('Maintenance request submitted successfully!');
      }
      setIsCreateDialogOpen(false);
      setIsEditMode(false);
      setEditingId(null);
      
      // Refresh requests list
      const resp = await connection.maintenance.getRequests({ tenant_id: user?.id });
      setRequests(Array.isArray(resp) ? resp : (resp?.results || []));
    } catch (error) {
      console.error('Error saving request:', error);
      toast.error('Failed to save maintenance request. Please try again.');
    }
  };

  const handleEditClick = (request) => {
    setFormData({
      title: request.title || '',
      description: request.description || '',
      priority: request.type || request.request_type || 'medium',
      file: null,
    });
    setEditingId(request.id);
    setIsEditMode(true);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this maintenance request?")) return;
    try {
      await connection.maintenance.deleteRequest(id);
      setRequests(requests.filter(r => String(r.id) !== String(id)));
      toast.success('Maintenance request deleted successfully!');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete maintenance request.');
    }
  };

  // Helper function to determine badge color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-[#ED1C24] text-white hover:bg-[#ED1C24]/90';
      case 'medium': return 'bg-[#F9E81B]/30 text-[#2E3192] hover:bg-[#F9E81B]/40';
      case 'low': return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper function to determine badge color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-[#2E3192] text-white hover:bg-[#2E3192]/90';
      case 'in_progress': return 'bg-[#F9E81B]/30 text-[#2E3192] hover:bg-[#F9E81B]/40';
      case 'pending': return 'bg-[#ED1C24]/10 text-[#ED1C24] hover:bg-[#ED1C24]/20';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout role="tenant">
      <div className="space-y-6">
        {/* Header with create button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2E3192]">Maintenance Requests</h1>
            <p className="text-gray-600 mt-1">
              Submit and track maintenance requests for Unit {user?.unitNumber}
            </p>
          </div>
          <Button
            onClick={() => {
              setFormData({ title: '', description: '', priority: 'medium', file: null });
              setIsEditMode(false);
              setEditingId(null);
              setIsCreateDialogOpen(true);
            }}
            className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Stats cards showing request overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Total Requests
                <Wrench className="h-4 w-4 text-[#2E3192]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">{requests.length}</div>
              <p className="text-xs text-gray-500 mt-1">All-time requests</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Pending
                <ClipboardList className="h-4 w-4 text-[#ED1C24]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#ED1C24]">
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Completed
                <CheckCircle className="h-4 w-4 text-[#2E3192]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">
                {requests.filter(r => r.status === 'completed').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Resolved issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#2E3192]">My Requests</CardTitle>
            <CardDescription>All your maintenance requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-[#F9E81B]/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-[#F9E81B]/30 p-2 rounded-lg">
                      <Wrench className="h-5 w-5 text-[#2E3192]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2E3192]">{request.title}</h3>
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
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2 items-center">
                      <Badge className={getStatusColor(request.status)}>
                        {(request.status || '').replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 text-[#2E3192]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => handleEditClick(request)} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4 text-[#2E3192]" />
                            <span>Edit Request</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteRequest(request.id)} className="cursor-pointer text-[#ED1C24] focus:text-[#ED1C24] focus:bg-[#ED1C24]/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Request</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
              {requests.length === 0 && (
                <div className="text-center py-12">
                  <Wrench className="h-10 w-10 mx-auto mb-3 text-[#2E3192]/30" />
                  <p className="text-sm text-gray-500">No maintenance requests yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Request Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setIsEditMode(false);
            setEditingId(null);
          }
        }}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">{isEditMode ? 'Update Maintenance Request' : 'Submit Maintenance Request'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update the details of your request' : "Describe the issue you're experiencing"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Title input */}
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Title <span className="text-[#ED1C24]">*</span></Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
              {/* Description textarea */}
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Description <span className="text-[#ED1C24]">*</span></Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about the issue..."
                  rows={4}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-gray-300">
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRequest}
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
              >
                {isEditMode ? 'Update Request' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}