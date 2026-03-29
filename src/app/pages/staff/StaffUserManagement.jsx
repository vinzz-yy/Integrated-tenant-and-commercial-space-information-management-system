import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Search, Plus, Edit, Trash2, Download, FileText, Table as TableIcon } from 'lucide-react';
import connection from '../../connected/connection.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu.jsx';
import { exportToCSV, exportToExcel, exportToWord, exportToDocx, printToPDF } from '../../exporting/export.js';

export function StaffUserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing users data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Loading states for async operations
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  
  // Form state for creating/editing Tenant users
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'tenant',
    phone: '',
    unitNumber: '',
    password: '',
  });

  const normalizeUser = (u) => ({
    ...u,
    firstName: u.firstName ?? u.first_name ?? '',
    lastName: u.lastName ?? u.last_name ?? '',
  });

  const sortUsersDesc = (list) => {
    return [...list].sort((a, b) => {
      const aNum = Number(a?.id);
      const bNum = Number(b?.id);
      const aFinite = Number.isFinite(aNum);
      const bFinite = Number.isFinite(bNum);
      if (aFinite && bFinite) return bNum - aNum;
      return String(b?.id ?? '').localeCompare(String(a?.id ?? ''), undefined, { numeric: true });
    });
  };

  // Load users when component mounts
  useEffect(() => {
    // Redirect if user is not a staff
    if (user?.role !== 'staff') {
      navigate('/');
      return;
    }
    
    const normalizeUsers = (data) => {
      const arr = Array.isArray(data) ? data : (data?.results || []);
      return arr.map((u) => normalizeUser(u));
    };
    
    const load = async () => {
      try {
        const [resp, unitsResp] = await Promise.all([
          connection.users.getUsers({ role: 'tenant' }), // ONLY fetch tenants
          connection.commercialSpace.getUnits()
        ]);
        const list = sortUsersDesc(normalizeUsers(resp));
        setUsers(list);
        setFilteredUsers(list);
        
        const uList = Array.isArray(unitsResp) ? unitsResp : (unitsResp?.results || []);
        setAvailableUnits(uList.filter(u => u.status === 'available'));
      } catch (e) {
        setUsers([]);
        setFilteredUsers([]);
        setAvailableUnits([]);
      }
    };
    load();
  }, [user, navigate]);

  // Filter users when search query changes
  useEffect(() => {
    let filtered = users;
    
    // Apply search filter (search by name or email)
    if (searchQuery) {
      filtered = filtered.filter(u =>
        (u.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Handle creating a new Tenant
  const handleCreateUser = async () => {
    try {
      setIsCreating(true);
      const payload = { ...formData, role: 'tenant' };
      const created = await connection.users.createUser(payload);
      setUsers((prev) => sortUsersDesc([...prev, normalizeUser(created)]));
      setIsCreateDialogOpen(false);
      resetForm();
      setResultTitle('Adding Tenant Successful');
      setResultMessage('The tenant has been added successfully.');
      setIsResultDialogOpen(true);
    } catch (error) {
      console.error('Error creating user:', error);
      setResultTitle('Failed Adding Tenant');
      setResultMessage(error?.message || 'Failed adding tenant. Please try again.');
      setIsResultDialogOpen(true);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle updating an existing Tenant
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsUpdating(true);
      const payload = { ...formData, role: 'tenant' };
      const updated = await connection.users.updateUser(String(selectedUser.id), payload);
      setUsers((prev) =>
        sortUsersDesc(
          prev.map((u) => (String(u.id) === String(selectedUser.id) ? normalizeUser(updated) : u))
        )
      );
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update tenant. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deleting a Tenant
  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this tenant?')) {
      try {
        await connection.users.deleteUser(String(userId));
        setUsers((prev) => prev.filter((u) => String(u.id) !== String(userId)));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete tenant. Please try again.');
      }
    }
  };

  // Handle exporting users
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      
      const rowsUsers = sortUsersDesc(users); // Since it's ALREADY filtered for tenants
      
      const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Phone', 'Unit Number'];
      const rows = rowsUsers.map(user => [
        user.id,
        user.email,
        user.firstName || '',
        user.lastName || '',
        user.role || '',
        user.phone || '',
        user.unitNumber || ''
      ]);

      if (format === 'csv') {
        exportToCSV(headers, rows, 'tenants_export.csv');
      } else if (format === 'excel') {
        exportToExcel(headers, rows, 'tenants_export.xls', 'Tenants Export');
      } else if (format === 'word') {
        exportToWord(headers, rows, 'tenants_export.doc', 'Tenants Export');
      } else if (format === 'docx') {
        await exportToDocx(headers, rows, 'tenants_export.docx', 'Tenants Export');
      } else if (format === 'pdf') {
        printToPDF(headers, rows, 'Tenants Export');
      }
    } catch (error) {
      console.error('Error exporting tenants:', error);
      alert('Failed to export tenants. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'tenant',
      phone: '',
      unitNumber: '',
    });
    setSelectedUser(null);
  };

  // Open edit dialog with selected user's data
  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: 'tenant',
      phone: user.phone || '',
      unitNumber: user.unitNumber || '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        {/* Header with title and action buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage tenant users explicitly assigned to this property
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF (Print)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('docx')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Word (.docx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('word')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Word (.doc)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <TableIcon className="h-4 w-4 mr-2" />
                  Excel (.xls)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <TableIcon className="h-4 w-4 mr-2" />
                  CSV (.csv)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Add user button */}
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        </div>

        {/* Filters card */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tenants by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users table */}
        <Card>
          <CardHeader>
            <CardTitle>Tenants ({filteredUsers.length})</CardTitle>
            <CardDescription>List of all system tenants</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Unit Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    {/* User avatar and name */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {(user.firstName || '?')[0]}{(user.lastName || '?')[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* User email */}
                    <TableCell className="text-sm">{user.email}</TableCell>
                    
                    {/* User phone */}
                    <TableCell className="text-sm">{user.phone || '-'}</TableCell>
                    
                    {/* User unit */}
                    <TableCell className="text-sm">
                      {user.unitNumber || '-'}
                    </TableCell>
                    
                    {/* User status */}
                    <TableCell>
                      <Badge variant="outline">{user.status || 'active'}</Badge>
                    </TableCell>
                    
                    {/* Action buttons */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
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

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Add a new tenant to the system
              </DialogDescription>
            </DialogHeader>
            
            {/* Form fields in a 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value="Tenant" disabled className="bg-gray-100" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="unitNumber">Unit Number</Label>
                <Select 
                  value={formData.unitNumber || "none"} 
                  onValueChange={(value) => setFormData({ ...formData, unitNumber: value === "none" ? "" : value })}
                >
                  <SelectTrigger id="unitNumber">
                    <SelectValue placeholder="Select an available unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Unit</SelectItem>
                    {formData.unitNumber && !availableUnits.find(u => (u.number || u.unitNumber) === formData.unitNumber) && (
                      <SelectItem value={formData.unitNumber}>
                        {formData.unitNumber} (Current)
                      </SelectItem>
                    )}
                    {availableUnits.map(unit => {
                      const unitId = unit.number || unit.unitNumber;
                      return (
                        <SelectItem key={unit.id} value={unitId}>
                          {unitId} ({unit.type})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Tenant'}
              </Button>
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

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Tenant</DialogTitle>
              <DialogDescription>
                Update tenant information
              </DialogDescription>
            </DialogHeader>
            
            {/* Form fields in a 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value="Tenant" disabled className="bg-gray-100" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="editUnitNumber">Unit Number</Label>
                <Select 
                  value={formData.unitNumber || "none"} 
                  onValueChange={(value) => setFormData({ ...formData, unitNumber: value === "none" ? "" : value })}
                >
                  <SelectTrigger id="editUnitNumber">
                    <SelectValue placeholder="Select an available unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Unit</SelectItem>
                    {formData.unitNumber && !availableUnits.find(u => (u.number || u.unitNumber) === formData.unitNumber) && (
                      <SelectItem value={formData.unitNumber}>
                        {formData.unitNumber} (Current)
                      </SelectItem>
                    )}
                    {availableUnits.map(unit => {
                      const unitId = unit.number || unit.unitNumber;
                      return (
                        <SelectItem key={unit.id} value={unitId}>
                          {unitId} ({unit.type})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Tenant'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
