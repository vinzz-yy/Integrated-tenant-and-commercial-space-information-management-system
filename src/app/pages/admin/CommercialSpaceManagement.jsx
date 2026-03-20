import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import {Dialog,DialogContent, DialogDescription,DialogFooter, DialogHeader,DialogTitle,} from '../../components/ui/dialog.jsx';
import {Select,SelectContent,SelectItem,SelectTrigger, SelectValue,} from '../../components/ui/select.jsx';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from '../../components/ui/table.jsx';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import connection from '../../connected/connection.js';

export function CommercialSpaceManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for managing units data
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  // Form state for creating new unit
  const [formData, setFormData] = useState({
    unitNumber: '',
    floor: 1,
    size: 0,
    type: 'Retail',
    rentalRate: 0,
    status: 'available',
  });

  // Initial load - fetch all units
  useEffect(() => {
    // Redirect if not admin
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const load = async () => {
      try {
        const resp = await connection.commercialSpace.getUnits();
        const list = Array.isArray(resp) ? resp : (resp?.results || []);
        setUnits(list);
        setFilteredUnits(list);
      } catch (e) {
        // Set empty arrays on error
        setUnits([]);
        setFilteredUnits([]);
      }
    };
    load();
  }, [user, navigate]);

  // Filter units when search query or status filter changes
  useEffect(() => {
    let filtered = units;
    
    // Apply search filter (search by unit number or tenant name)
    if (searchQuery) {
      filtered = filtered.filter(u =>
        (u.unitNumber || u.number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.tenant_name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }
    
    setFilteredUnits(filtered);
  }, [searchQuery, statusFilter, units]);

  // Handler for creating a new unit
  const handleCreateUnit = async () => {
    try {
      const created = await connection.commercialSpace.createUnit({
        number: formData.unitNumber,
        floor: formData.floor,
        type: formData.type.toLowerCase(),
        status: formData.status,
      });
      // Refresh list from server to ensure fields and image URL are populated
      const resp = await connection.commercialSpace.getUnits();
      const list = Array.isArray(resp) ? resp : (resp?.results || []);
      setUnits(list);
      setFilteredUnits(list);
      setIsCreateDialogOpen(false);
      setResultTitle('Adding Unit Successful');
      setResultMessage('The unit has been added successfully.');
      setIsResultDialogOpen(true);
    } catch (error) {
      console.error('Error creating unit:', error);
      setResultTitle('Failed Adding Unit');
      setResultMessage('Failed adding unit. Please try again.');
      setIsResultDialogOpen(true);
    }
  };

  const openEditDialog = (unit) => {
    setSelectedUnit(unit);
    setFormData({
      unitNumber: unit.number || unit.unitNumber || '',
      floor: Number(unit.floor) || 0,
      size: Number(unit.size) || 0,
      type: (unit.type || 'Retail'),
      rentalRate: Number(unit.rental_rate || unit.rentalRate || 0),
      status: unit.status || 'available',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (unit) => {
    setSelectedUnit(unit);
    setIsViewDialogOpen(true);
  };

  const handleUpdateUnit = async () => {
    if (!selectedUnit) return;
    try {
      const payload = {
        number: formData.unitNumber,
        floor: formData.floor,
        type: (formData.type || '').toLowerCase(),
        status: formData.status,
      };
      const updated = await connection.commercialSpace.updateUnit(String(selectedUnit.id), payload);
      const resp = await connection.commercialSpace.getUnits();
      const list = Array.isArray(resp) ? resp : (resp?.results || []);
      setUnits(list);
      setFilteredUnits(list);
      setIsEditDialogOpen(false);
      setSelectedUnit(null);
      setResultTitle('Updating Unit Successful');
      setResultMessage('The unit has been updated successfully.');
      setIsResultDialogOpen(true);
    } catch (error) {
      console.error('Error updating unit:', error);
      setResultTitle('Failed Updating Unit');
      setResultMessage('Failed updating unit. Please try again.');
      setIsResultDialogOpen(true);
    }
  };

  // Handler for deleting a unit
  const handleDeleteUnit = async (id) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      try {
        await connection.commercialSpace.deleteUnit(String(id));
        // Remove deleted unit from state
        setUnits(units.filter(u => String(u.id) !== String(id)));
      } catch (error) {
        console.error('Error deleting unit:', error);
        alert('Failed to delete unit. Please try again.');
      }
    }
  };

  // Helper function to determine badge color based on status
  const getStatusVariant = (status) => {
    switch (status) {
      case 'occupied': return 'default'; // Blue badge
      case 'available': return 'secondary'; // Gray badge
      case 'reserved': return 'outline'; // Outlined badge
      case 'maintenance': return 'destructive'; // Red badge
      default: return 'outline';
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header with title and add button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Commercial Space Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all commercial units and tenants
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </div>

        {/* Stats cards showing unit overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{units.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Occupied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {units.filter(u => u.status === 'occupied').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {units.filter(u => u.status === 'available').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Occupancy Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {units.length ? Math.round((units.filter(u => u.status === 'occupied').length / units.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters card - search and status filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search input with icon */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by unit or tenant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Status filter dropdown */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Units table */}
        <Card>
          <CardHeader>
            <CardTitle>Commercial Units ({filteredUnits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">Unit Number</TableHead>
                  <TableHead className="w-[10%]">Floor</TableHead>
                  <TableHead className="w-[15%]">Type</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[30%]">Tenant</TableHead>
                  <TableHead className="text-right w-[15%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium truncate">{unit.number || unit.unitNumber}</TableCell>
                    <TableCell>{unit.floor}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{unit.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(unit.status)} className="capitalize">
                        {unit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm truncate">
                      {unit.tenant_name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openViewDialog(unit)}>
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(unit)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteUnit(unit.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Unit Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Commercial Unit</DialogTitle>
              <DialogDescription>Add a new commercial space unit</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit Number</Label>
                  <Input
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    placeholder="e.g., A-101"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUnit}>Create Unit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Unit Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Commercial Unit Details</DialogTitle>
              <DialogDescription>View full details of the selected unit</DialogDescription>
            </DialogHeader>
            {selectedUnit && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-xs">Unit Number</Label>
                    <p className="font-semibold text-lg">{selectedUnit.number || selectedUnit.unitNumber}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <Label className="text-gray-500 text-xs">Floor</Label>
                    <p className="font-semibold text-lg">{selectedUnit.floor}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-xs">Type</Label>
                    <div>
                      <Badge variant="outline" className="capitalize">{selectedUnit.type}</Badge>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Label className="text-gray-500 text-xs">Status</Label>
                    <div>
                      <Badge variant={getStatusVariant(selectedUnit.status)} className="capitalize">
                        {selectedUnit.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                   <Label className="text-gray-500 text-xs">Current Tenant</Label>
                   <p className="font-medium text-gray-900 mt-1">
                     {selectedUnit.tenant_name || 'No tenant assigned'}
                   </p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                   {selectedUnit.size && (
                     <div className="space-y-1">
                       <Label className="text-gray-500 text-xs">Size</Label>
                       <p className="font-medium">{selectedUnit.size} sqm</p>
                     </div>
                   )}
                   {(selectedUnit.monthly_rent || selectedUnit.monthlyRent || selectedUnit.rental_rate || selectedUnit.rentalRate) && (
                     <div className="space-y-1 text-right">
                       <Label className="text-gray-500 text-xs">Monthly Rent</Label>
                       <p className="font-semibold text-blue-600">
                         ₱{Number(selectedUnit.monthly_rent || selectedUnit.monthlyRent || selectedUnit.rental_rate || selectedUnit.rentalRate).toLocaleString()}
                       </p>
                     </div>
                   )}
                 </div>

                 {selectedUnit.amenities && (
                   <div className="pt-4 border-t">
                     <Label className="text-gray-500 text-xs">Amenities</Label>
                     <p className="text-sm text-gray-600 mt-1">{selectedUnit.amenities}</p>
                   </div>
                 )}
               </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Unit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Commercial Unit</DialogTitle>
              <DialogDescription>Update unit details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit Number</Label>
                  <Input
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    placeholder="e.g., A-101"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUnit}>Update Unit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{resultTitle}</DialogTitle>
              <DialogDescription>{resultMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setIsResultDialogOpen(false)}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
