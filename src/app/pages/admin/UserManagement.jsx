// UserManagement.jsx - Admin user management page
// Allows administrators to view, create, edit, delete, and export system users

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Search, Plus, Edit, Trash2, Download } from 'lucide-react';
import api from '../../services/api.js';

export function UserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing users data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Loading states for async operations
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Form state for creating/editing users
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'staff',
    phone: '',
    unitNumber: '',
    department: '',
    password: '',
  });

  // Load users when component mounts
  useEffect(() => {
    // Redirect if user is not an admin
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const load = async () => {
      try {
        const resp = await api.users.getUsers();
        setUsers(resp.results || []);
        setFilteredUsers(resp.results || []);
      } catch (e) {
        // Set empty arrays on error
        setUsers([]);
        setFilteredUsers([]);
      }
    };
    load();
  }, [user, navigate]);

  // Filter users when search query or role filter changes
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
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  // Handle creating a new user
  const handleCreateUser = async () => {
    try {
      setIsCreating(true);
      const created = await api.users.createUser(formData);
      setUsers([...users, created]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle updating an existing user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsUpdating(true);
      const updated = await api.users.updateUser(String(selectedUser.id), formData);
      setUsers(users.map(u => String(u.id) === String(selectedUser.id) ? updated : u));
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.users.deleteUser(String(userId));
        setUsers(users.filter(u => String(u.id) !== String(userId)));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  // Handle exporting users to CSV
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Fetch all users data
      const allUsers = await api.users.getUsers();
      
      // Convert to CSV format
      const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Phone', 'Department', 'Unit Number'];
      const csvContent = [
        headers.join(','),
        ...allUsers.results.map(user => [
          user.id,
          user.email,
          user.firstName || '',
          user.lastName || '',
          user.role || '',
          user.phone || '',
          user.department || '',
          user.unitNumber || ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'users_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export users. Please try again.');
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
      role: 'staff',
      phone: '',
      unitNumber: '',
      department: '',
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
      role: user.role || 'staff',
      phone: user.phone || '',
      unitNumber: user.unitNumber || '',
      department: user.department || '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header with title and action buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage system users and their access levels
            </p>
          </div>
          <div className="flex gap-2">
            {/* Export button */}
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            
            {/* Add user button */}
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters card */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Role filter dropdown */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>List of all system users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Unit/Department</TableHead>
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
                    
                    {/* User role badge */}
                    <TableCell>
                      <Badge variant={user.role === 'staff' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    
                    {/* User phone */}
                    <TableCell className="text-sm">{user.phone || '-'}</TableCell>
                    
                    {/* User unit or department */}
                    <TableCell className="text-sm">
                      {user.unitNumber || user.department || '-'}
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
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system
              </DialogDescription>
            </DialogHeader>
            
            {/* Form fields in a 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* First name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              
              {/* Last name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              
              {/* Email (full width) */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              {/* Password (full width) */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              
              {/* Role select */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              {/* Conditional fields based on role */}
              {formData.role === 'tenant' && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input
                    id="unitNumber"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                  />
                </div>
              )}
              
              {formData.role === 'staff' && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information
              </DialogDescription>
            </DialogHeader>
            
            {/* Form fields in a 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* First name */}
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              
              {/* Last name */}
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              
              {/* Email (full width) */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              {/* Role select */}
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              {/* Conditional fields based on role */}
              {formData.role === 'tenant' && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="editUnitNumber">Unit Number</Label>
                  <Input
                    id="editUnitNumber"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                  />
                </div>
              )}
              
              {formData.role === 'staff' && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="editDepartment">Department</Label>
                  <Input
                    id="editDepartment"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}