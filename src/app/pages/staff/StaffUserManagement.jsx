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
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  
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

  useEffect(() => {
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
          connection.users.getUsers({ role: 'tenant' }),
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

  useEffect(() => {
    let filtered = users;
    
    if (searchQuery) {
      filtered = filtered.filter(u =>
        (u.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

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

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      
      const rowsUsers = sortUsersDesc(users);
      
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
            <h1 className="text-3xl font-bold text-[#2E3192]">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage tenant users explicitly assigned to this property
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-300" disabled={isExporting}>
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
            
            <Button
              className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        </div>

        {/* Filters card */}
        <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
          <CardHeader>
            <CardTitle className="text-[#2E3192]">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tenants by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[#2E3192]">Tenants ({filteredUsers.length})</CardTitle>
            <CardDescription>List of all system tenants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#2E3192] font-semibold">Tenant</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Email</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Phone</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Unit Number</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Status</TableHead>
                    <TableHead className="text-right text-[#2E3192] font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-[#F9E81B]/5">
                      {/* User avatar and name */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-[#2E3192]/10 text-[#2E3192] text-xs font-semibold">
                              {(user.firstName || '?')[0]}{(user.lastName || '?')[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-[#2E3192]">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm">{user.phone || '-'}</TableCell>
                      
                      <TableCell className="text-sm">
                        {user.unitNumber || '-'}
                      </TableCell>
                      
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 capitalize">
                          {user.status || 'active'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-[#F9E81B]/20 text-[#2E3192]"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-[#ED1C24]/10"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-[#ED1C24]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Tenant Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Create New Tenant</DialogTitle>
              <DialogDescription>
                Add a new tenant to the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#2E3192] font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#2E3192] font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email" className="text-[#2E3192] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="password" className="text-[#2E3192] font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Role</Label>
                <Input value="Tenant" disabled className="bg-gray-100" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#2E3192] font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="unitNumber" className="text-[#2E3192] font-medium">Unit Number</Label>
                <Select 
                  value={formData.unitNumber || "none"} 
                  onValueChange={(value) => setFormData({ ...formData, unitNumber: value === "none" ? "" : value })}
                >
                  <SelectTrigger id="unitNumber" className="border-gray-200">
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
              <Button variant="outline" className="border-gray-300" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                onClick={handleCreateUser}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Tenant'}
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

        {/* Edit Tenant Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Edit Tenant</DialogTitle>
              <DialogDescription>
                Update tenant information
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName" className="text-[#2E3192] font-medium">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editLastName" className="text-[#2E3192] font-medium">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="editEmail" className="text-[#2E3192] font-medium">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">Role</Label>
                <Input value="Tenant" disabled className="bg-gray-100" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editPhone" className="text-[#2E3192] font-medium">Phone</Label>
                <Input
                  id="editPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="editUnitNumber" className="text-[#2E3192] font-medium">Unit Number</Label>
                <Select 
                  value={formData.unitNumber || "none"} 
                  onValueChange={(value) => setFormData({ ...formData, unitNumber: value === "none" ? "" : value })}
                >
                  <SelectTrigger id="editUnitNumber" className="border-gray-200">
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
              <Button variant="outline" className="border-gray-300" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
                onClick={handleUpdateUser}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Tenant'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}