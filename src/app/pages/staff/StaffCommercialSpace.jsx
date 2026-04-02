import { useState, useEffect } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Search, Plus, Edit, Trash2, Eye, Building, Users, CheckCircle, Wrench } from 'lucide-react';
import connection from '../../connected/connection.js';

export function StaffCommercialSpace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  const [formData, setFormData] = useState({
    unitNumber: '',
    floor: 1,
    size: 0,
    type: 'Retail',
    rentalRate: 0,
    status: 'available',
    tenantId: 'none',
  });

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userFormData, setUserFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'tenant',
    phone: '',
    unitNumber: '',
    password: '',
  });

  useEffect(() => {
    if (user?.role !== 'staff') {
      navigate('/');
      return;
    }
    
    const load = async () => {
      try {
        const [unitsData, usersData] = await Promise.all([
          connection.commercialSpace.getUnits(),
          connection.users.getUsers()
        ]);
        
        const list = Array.isArray(unitsData) ? unitsData : (unitsData?.results || []);
        setUnits(list);
        setFilteredUnits(list);
        
        const usersList = Array.isArray(usersData) ? usersData : (usersData?.results || []);
        setTenants(usersList.filter(u => 
          (u.role || '').toLowerCase() === 'tenant' || 
          (u.role || '').toLowerCase() === 'user'
        ));
      } catch (e) {
        setUnits([]);
        setFilteredUnits([]);
      }
    };
    load();
  }, [user, navigate]);

  useEffect(() => {
    let filtered = units;
    
    if (searchQuery) {
      filtered = filtered.filter(u =>
        (u.unitNumber || u.number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.tenant_name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }
    
    setFilteredUnits(filtered);
  }, [searchQuery, statusFilter, units]);

  const handleCreateUnit = async () => {
    try {
      const created = await connection.commercialSpace.createUnit({
        number: formData.unitNumber,
        floor: formData.floor,
        type: formData.type.toLowerCase(),
        status: formData.status,
      });
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
      tenantId: unit.tenant_id ? String(unit.tenant_id) : 'none',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (unit) => {
    setSelectedUnit(unit);
    setIsViewDialogOpen(true);
  };

  const openCreateUserForUnit = (unit) => {
    setUserFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'tenant',
      phone: '',
      unitNumber: unit.number || unit.unitNumber || '',
      password: '',
    });
    setIsAddUserDialogOpen(true);
  };

  const handleCreateUser = async () => {
    try {
      setIsCreatingUser(true);
      await connection.users.createUser(userFormData);
      
      const resp = await connection.commercialSpace.getUnits();
      const list = Array.isArray(resp) ? resp : (resp?.results || []);
      setUnits(list);
      setFilteredUnits(list);
      
      setIsAddUserDialogOpen(false);
      setIsViewDialogOpen(false);
      
      setResultTitle('Adding User Successful');
      setResultMessage('The user has been added and assigned to the unit successfully.');
      setIsResultDialogOpen(true);
    } catch (error) {
      console.error('Error creating user:', error);
      setResultTitle('Failed Adding User');
      setResultMessage('Failed adding user. Please try again.');
      setIsResultDialogOpen(true);
    } finally {
      setIsCreatingUser(false);
    }
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
      
      if (formData.tenantId && formData.tenantId !== 'none') {
        payload.tenant = parseInt(formData.tenantId, 10);
        const selectedTenant = tenants.find(t => String(t.id) === String(formData.tenantId));
        if (selectedTenant) {
          payload.tenant_name = (`${selectedTenant.first_name || ''} ${selectedTenant.last_name || ''}`).trim() || selectedTenant.username || selectedTenant.email;
        }
      } else {
        payload.tenant = null;
        payload.tenant_name = '';
      }

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

  const handleDeleteUnit = async (id) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      try {
        await connection.commercialSpace.deleteUnit(String(id));
        setUnits(units.filter(u => String(u.id) !== String(id)));
      } catch (error) {
        console.error('Error deleting unit:', error);
        alert('Failed to delete unit. Please try again.');
      }
    }
  };

  // Replaced with brand-color system from second code
  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return 'bg-[#2E3192] text-white hover:bg-[#2E3192]/90';
      case 'available':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'reserved':
        return 'bg-[#F9E81B]/30 text-[#2E3192] hover:bg-[#F9E81B]/40';
      case 'maintenance':
        return 'bg-[#ED1C24]/10 text-[#ED1C24] hover:bg-[#ED1C24]/20';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        {/* Header with title and add button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2E3192]">
              Commercial Space Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all commercial units and tenants
            </p>
          </div>
          <Button
            className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Total Units
                <Building className="h-4 w-4 text-[#2E3192]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">{units.length}</div>
              <p className="text-xs text-gray-500 mt-1">All units</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Occupied
                <Users className="h-4 w-4 text-[#2E3192]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">
                {units.filter(u => u.status === 'occupied').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">With tenants</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Available
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {units.filter(u => u.status === 'available').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Ready for lease</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Occupancy Rate
                <Wrench className="h-4 w-4 text-[#ED1C24]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#ED1C24]">
                {units.length ? Math.round((units.filter(u => u.status === 'occupied').length / units.length) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Current rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters card */}
        <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
          <CardHeader>
            <CardTitle className="text-[#2E3192]">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by unit or tenant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Units table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[#2E3192]">Commercial Units ({filteredUnits.length})</CardTitle>
            <CardDescription>View and manage commercial units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[15%] text-[#2E3192] font-semibold">Unit Number</TableHead>
                    <TableHead className="w-[10%] text-[#2E3192] font-semibold">Floor</TableHead>
                    <TableHead className="w-[15%] text-[#2E3192] font-semibold">Type</TableHead>
                    <TableHead className="w-[15%] text-[#2E3192] font-semibold">Status</TableHead>
                    <TableHead className="w-[30%] text-[#2E3192] font-semibold">Tenant</TableHead>
                    <TableHead className="text-right w-[15%] text-[#2E3192] font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <Building className="h-10 w-10 mx-auto mb-3 text-[#2E3192]/30" />
                        <p className="text-sm text-gray-500">No units found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUnits.map((unit) => (
                      <TableRow key={unit.id} className="hover:bg-[#F9E81B]/5">
                        <TableCell className="font-medium text-[#2E3192] truncate">{unit.number || unit.unitNumber}</TableCell>
                        <TableCell>{unit.floor}</TableCell>
                        <TableCell>
                          <Badge className="bg-[#2E3192]/10 text-[#2E3192] hover:bg-[#2E3192]/20 capitalize">
                            {unit.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${getStatusColor(unit.status)}`}>
                            {unit.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm truncate">
                          {unit.tenant_name || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-[#F9E81B]/20"
                              onClick={() => openViewDialog(unit)}
                            >
                              <Eye className="h-4 w-4 text-[#2E3192]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-[#F9E81B]/20"
                              onClick={() => openEditDialog(unit)}
                            >
                              <Edit className="h-4 w-4 text-[#2E3192]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-[#ED1C24]/10"
                              onClick={() => handleDeleteUnit(unit.id)}
                            >
                              <Trash2 className="h-4 w-4 text-[#ED1C24]" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Unit Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Create Commercial Unit</DialogTitle>
              <DialogDescription>Add a new commercial space unit</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Unit Number</Label>
                  <Input
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    placeholder="e.g., A-101"
                    className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Floor</Label>
                  <Input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                    className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="border-gray-200">
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
                  <Label className="text-[#2E3192] font-medium">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="border-gray-200">
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
              <Button variant="outline" className="border-gray-300" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                onClick={handleCreateUnit}
              >
                Create Unit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Unit Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Commercial Unit Details</DialogTitle>
              <DialogDescription>View full details of the selected unit</DialogDescription>
            </DialogHeader>
            {selectedUnit && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-xs">Unit Number</Label>
                    <p className="font-semibold text-lg text-[#2E3192]">{selectedUnit.number || selectedUnit.unitNumber}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <Label className="text-gray-500 text-xs">Floor</Label>
                    <p className="font-semibold text-lg text-[#2E3192]">{selectedUnit.floor}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-xs">Type</Label>
                    <div>
                      <Badge className="bg-[#2E3192]/10 text-[#2E3192] hover:bg-[#2E3192]/20 capitalize">
                        {selectedUnit.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Label className="text-gray-500 text-xs">Status</Label>
                    <div>
                      <Badge className={`capitalize ${getStatusColor(selectedUnit.status)}`}>
                        {selectedUnit.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between items-center">
                  <div>
                    <Label className="text-gray-500 text-xs">Current Tenant</Label>
                    <p className="font-medium text-[#2E3192] mt-1">
                      {selectedUnit.tenant_name || 'No tenant assigned'}
                    </p>
                  </div>
                  {!selectedUnit.tenant_name && (
                    <Button
                      size="sm"
                      className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                      onClick={() => openCreateUserForUnit(selectedUnit)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add User
                    </Button>
                  )}
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
                      <p className="font-semibold text-[#2E3192]">
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
              <Button
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Unit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Edit Commercial Unit</DialogTitle>
              <DialogDescription>Update unit details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Unit Number</Label>
                  <Input
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    placeholder="e.g., A-101"
                    className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Floor</Label>
                  <Input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                    className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#2E3192] font-medium">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="border-gray-200">
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
                  <Label className="text-[#2E3192] font-medium">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="border-gray-200">
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
              
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Assigned Tenant</Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(value) => setFormData({ ...formData, tenantId: value })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Tenant</SelectItem>
                    {tenants.map(t => {
                      const fullName = `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.username;
                      return (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {fullName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="border-gray-300" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                onClick={handleUpdateUnit}
              >
                Update Unit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Result Dialog */}
        <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">{resultTitle}</DialogTitle>
              <DialogDescription>{resultMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                onClick={() => setIsResultDialogOpen(false)}
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Create New User for Unit {userFormData.unitNumber}</DialogTitle>
              <DialogDescription>
                Add a new tenant user and assign them to this unit.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#2E3192] font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={userFormData.firstName}
                  onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#2E3192] font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  value={userFormData.lastName}
                  onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email" className="text-[#2E3192] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="password" className="text-[#2E3192] font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#2E3192] font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitNumber" className="text-[#2E3192] font-medium">Unit Number</Label>
                <Input
                  id="unitNumber"
                  value={userFormData.unitNumber}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" className="border-gray-300" onClick={() => setIsAddUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                onClick={handleCreateUser}
                disabled={isCreatingUser}
              >
                {isCreatingUser ? 'Creating...' : 'Create & Assign User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}