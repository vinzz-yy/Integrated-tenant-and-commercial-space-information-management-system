// StaffCommercialSpace.jsx - Staff view for managing commercial units
// Allows staff to view and update commercial unit information

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Edit, Save } from 'lucide-react';
import api from '../../services/api.js';

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
      const resp = await api.commercialSpace.getUnits();
      setUnits(resp.results || []);
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
    // Validate required fields
    if (!formData.unitNumber || !formData.floor || !formData.type || !formData.status) {
      return;
    }
    
    // Update unit via API
    await api.commercialSpace.updateUnit(String(selectedUnit.id), {
      number: formData.unitNumber,
      floor: parseInt(formData.floor) || 0,
      type: formData.type,
      status: formData.status,
      tenant_name: formData.tenantName || null,
    });
    
    // Refresh units list
    const refreshed = await api.commercialSpace.getUnits();
    setUnits(refreshed.results || []);
    setIsEditDialogOpen(false);
  };

  // Helper function to determine badge color based on status
  const getStatusVariant = (status) => {
    switch (status) {
      case 'occupied':
        return 'default'; // Blue badge
      case 'available':
        return 'secondary'; // Gray badge
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Commercial Units
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
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
                        className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
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