import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Edit, Save } from 'lucide-react';
import connection from '../../connected/connection.js';

export function StaffCommercialSpace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing units data
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Form state for editing unit
  const [formData, setFormData] = useState({
    unitNumber: '',
    floor: '',
    size: '',
    type: '',
    status: '',
    tenantName: '',
    monthlyRent: '',
    leaseStart: '',
    leaseEnd: '',
  });

  // Redirect if not staff
  useEffect(() => {
    if (user?.role !== 'staff') navigate('/');
  }, [user, navigate]);

  // Load all commercial units
  useEffect(() => {
    const load = async () => {
      const data = await connection.commercialSpace.getUnits();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setUnits(list);
    };
    load();
  }, []);

  // Open edit dialog with selected unit's data
  const openEditDialog = (unit) => {
    setSelectedUnit(unit);
    setFormData({
      unitNumber: unit.number || unit.unitNumber || '',
      floor: String(unit.floor || ''),
      size: String(unit.size || ''),
      type: unit.type || '',
      status: unit.status || '',
      tenantName: unit.tenant_name || '',
      monthlyRent: String(unit.monthlyRent || ''),
      leaseStart: unit.leaseStart || '',
      leaseEnd: unit.leaseEnd || '',
    });
    setIsEditDialogOpen(true);
  };

  // Handle updating unit information
  const handleUpdateUnit = async () => {
    try {
      // Validate required fields
      if (!formData.unitNumber || !formData.floor || !formData.type || !formData.status) {
        alert('Please fill all required fields');
        return;
      }
      // Build payload using serializer-supported fields only
      const payload = {
        number: formData.unitNumber,
        floor: parseInt(formData.floor, 10) || 0,
        type: (formData.type || '').toLowerCase(),
        status: formData.status,
      };
      if (formData.size) payload.size = parseFloat(formData.size);
      if (formData.monthlyRent) payload.monthlyRent = parseFloat(formData.monthlyRent);
      if (formData.leaseStart) payload.leaseStartDate = formData.leaseStart;
      if (formData.leaseEnd) payload.leaseEndDate = formData.leaseEnd;
      if (formData.tenantName) payload.tenantName = formData.tenantName;
      // Send update
      await connection.commercialSpace.updateUnit(String(selectedUnit.id), payload);
      // Refresh units list
      const refreshed = await connection.commercialSpace.getUnits();
      const list = Array.isArray(refreshed) ? refreshed : (refreshed?.results || []);
      setUnits(list);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating unit:', error);
      alert('Failed to update unit. Please check values and try again.');
    }
  };

  // Helper function to determine badge color based on status
  const getStatusVariant = (status) => {
    switch (status) {
      case 'occupied':
        return 'default'; // Blue badge
      case 'available':
        return 'secondary'; // Gray badge
      case 'reserved':
        return 'outline'; // Outline badge
      case 'maintenance':
        return 'destructive'; // Red badge
      default:
        return 'outline';
    }
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Commercial Units
          </h1>
          <p className="text-gray-600 mt-1">
            View and edit commercial space units
          </p>
        </div>

        {/* Units table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Units ({units.length})</CardTitle>
            <CardDescription>View and manage commercial units</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Unit Number</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.number || unit.unitNumber}</TableCell>
                    {/* optional thumbnail */}
                    {/* <img src={api.mediaUrl(unit.image)} alt="" className="h-8 w-12 object-cover rounded border mr-2" /> */}
                    <TableCell>{unit.floor}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {unit.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(unit.status)} className="capitalize">
                        {unit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{unit.tenant_name || unit.tenantName || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(unit)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Unit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Update Commercial Unit</DialogTitle>
              <DialogDescription>
                Edit unit details and information
              </DialogDescription>
            </DialogHeader>
            {selectedUnit && (
              <div className="grid grid-cols-2 gap-4 py-4">
                {/* Unit Number */}
                <div className="space-y-2">
                  <Label htmlFor="unitNumber">Unit Number *</Label>
                  <Input
                    id="unitNumber"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    placeholder="e.g., A-101"
                  />
                </div>
                
                {/* Floor */}
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor *</Label>
                  <Input
                    id="floor"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="e.g., 1"
                  />
                </div>
                
                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Restaurant">Restaurant</SelectItem>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Tenant Name */}
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Tenant Name</Label>
                  <Input
                    id="tenantName"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                    placeholder="Tenant name (if occupied)"
                  />
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <Label htmlFor="size">Size (sqm)</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g., 100"
                  />
                </div>
                
                {/* Monthly Rent */}
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Monthly Rent</Label>
                  <Input
                    id="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                    placeholder="e.g., 50000"
                  />
                </div>
                
                {/* Lease Start */}
                <div className="space-y-2">
                  <Label htmlFor="leaseStart">Lease Start Date</Label>
                  <Input
                    id="leaseStart"
                    type="date"
                    value={formData.leaseStart}
                    onChange={(e) => setFormData({ ...formData, leaseStart: e.target.value })}
                  />
                </div>
                
                {/* Lease End */}
                <div className="space-y-2">
                  <Label htmlFor="leaseEnd">Lease End Date</Label>
                  <Input
                    id="leaseEnd"
                    type="date"
                    value={formData.leaseEnd}
                    onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUnit} className="gap-2">
                <Save className="h-4 w-4" />
                Update Unit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
