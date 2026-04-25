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
import { Search, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import connection from '../../connected/connection.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu.jsx';

export function UserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for storing users data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Loading states for async operations
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');

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
    leaseStartDate: '',
    leaseEndDate: '',
  });

  /**
   * Normalizes user object to ensure consistent field names
   * Converts snake_case to camelCase and formats dates
   */
  const normalizeUser = (u) => {
    const leaseStart = u.leaseStartDate ?? u.lease_start_date ?? u.profile?.lease_start_date;
    const leaseEnd = u.leaseEndDate ?? u.lease_end_date ?? u.profile?.lease_end_date;
    
    return {
      ...u,
      firstName: u.firstName ?? u.first_name ?? '',
      lastName: u.lastName ?? u.last_name ?? '',
      leaseStartDate: leaseStart ? String(leaseStart).split('T')[0] : '',
      leaseEndDate: leaseEnd ? String(leaseEnd).split('T')[0] : '',
    };
  };

  /**
   * Sorts users in descending order by ID
   * Handles both numeric and string IDs
   */
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

  /**
   * Loads users and available units when component mounts
   * Redirects non-admin users to home page
   */
  useEffect(() => {
    // Redirect if user is not an admin
    if (user?.role !== 'admin') {
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
          connection.users.getUsers(),
          connection.commercialSpace.getUnits()
        ]);
        const list = sortUsersDesc(normalizeUsers(resp));
        setUsers(list);
        setFilteredUsers(list);

        const uList = Array.isArray(unitsResp) ? unitsResp : (unitsResp?.results || []);
        setAvailableUnits(uList.filter(u => u.status === 'available'));
      } catch (e) {
        // Set empty arrays on error
        setUsers([]);
        setFilteredUsers([]);
        setAvailableUnits([]);
      }
    };
    load();
  }, [user, navigate]);

  /**
   * Filters users based on search query and role selection
   * Updates filteredUsers state whenever filters change
   */
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

  /**
   * Creates a new user with form data
   * Shows success/error dialog after completion
   */
  const handleCreateUser = async () => {
    try {
      setIsCreating(true);
      const payload = {
        ...formData,
        first_name: formData.firstName,
        last_name: formData.lastName,
        unit_number: formData.unitNumber,
        lease_start_date: formData.leaseStartDate || null,
        lease_end_date: formData.leaseEndDate || null,
      };
      const created = await connection.users.createUser(payload);
      setUsers((prev) => sortUsersDesc([...prev, normalizeUser(created)]));
      setIsCreateDialogOpen(false);
      resetForm();
      setResultTitle('Adding User Successful');
      setResultMessage('The user has been added successfully.');
      setIsResultDialogOpen(true);
    } catch (error) {
      console.error('Error creating user:', error);
      setResultTitle('Failed Adding User');
      setResultMessage('Failed adding user. Please try again.');
      setIsResultDialogOpen(true);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Updates an existing user's information
   * Only updates password if a new one is provided
   */
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setIsUpdating(true);
      const payload = {
        ...formData,
        first_name: formData.firstName,
        last_name: formData.lastName,
        unit_number: formData.unitNumber,
        lease_start_date: formData.leaseStartDate || null,
        lease_end_date: formData.leaseEndDate || null,
      };
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
      alert('Failed to update user. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Opens delete confirmation dialog for a user
   */
  const confirmDeleteUser = (userId) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Executes user deletion after confirmation
   */
  const executeDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await connection.users.deleteUser(String(userToDelete));
      setUsers((prev) => prev.filter((u) => String(u.id) !== String(userToDelete)));
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  /**
   * Resets form data to initial empty state
   */
  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'staff',
      phone: '',
      unitNumber: '',
      department: '',
      password: '',
      leaseStartDate: '',
      leaseEndDate: '',
    });
    setSelectedUser(null);
  };

  /**
   * Opens edit dialog and populates form with selected user's data
   */
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
      leaseStartDate: user.leaseStartDate ? user.leaseStartDate.split('T')[0] : '',
      leaseEndDate: user.leaseEndDate ? user.leaseEndDate.split('T')[0] : '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header with title and action buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2E3192]">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage system users and their access levels
            </p>
          </div>
          <div className="flex gap-2">
            {/* Add user button */}
            <Button
              className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters card */}
        <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
          <CardHeader>
            <CardTitle className="text-[#2E3192]">Filters</CardTitle>
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
                  className="pl-10 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>

              {/* Role filter dropdown */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="border-gray-200">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-[#2E3192]">Users ({filteredUsers.length})</CardTitle>
            <CardDescription>List of all system users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#2E3192] font-semibold">User</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Email</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Role</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Phone</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Unit/Department</TableHead>
                    <TableHead className="text-[#2E3192] font-semibold">Lease Period</TableHead>
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

                      {/* User email */}
                      <TableCell className="text-sm">{user.email}</TableCell>

                      {/* User role badge */}
                      <TableCell>
                        <Badge className={
                          user.role === 'staff'
                            ? 'bg-[#2E3192] text-white hover:bg-[#2E3192]/90 capitalize'
                            : 'bg-[#F9E81B]/30 text-[#2E3192] hover:bg-[#F9E81B]/40 capitalize'
                        }>
                          {user.role}
                        </Badge>
                      </TableCell>

                      {/* User phone */}
                      <TableCell className="text-sm">{user.phone || '-'}</TableCell>

                      {/* User unit or department */}
                      <TableCell className="text-sm">
                        {user.unitNumber || user.department || '-'}
                      </TableCell>

                      {/* User lease period */}
                      <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                        {user.role === 'tenant' ? (
                          <div className="flex flex-col">
                            <span>Start: {user.leaseStartDate ? String(user.leaseStartDate).split('T')[0] : '-'}</span>
                            <span>End: {user.leaseEndDate ? String(user.leaseEndDate).split('T')[0] : '-'}</span>
                          </div>
                        ) : '-'}
                      </TableCell>

                      {/* User status */}
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 capitalize">
                          {user.status || 'active'}
                        </Badge>
                      </TableCell>

                      {/* Action buttons */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4 text-[#2E3192]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem onClick={() => openEditDialog(user)} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4 text-[#2E3192]" />
                              <span>Update User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => confirmDeleteUser(user.id)} className="cursor-pointer text-[#ED1C24] focus:text-[#ED1C24] focus:bg-[#ED1C24]/10">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system
              </DialogDescription>
            </DialogHeader>

            {/* Form fields in a 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* First name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#2E3192] font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>

              {/* Last name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#2E3192] font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>

              {/* Email (full width) */}
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

              {/* Password (full width) */}
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

              {/* Role select */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-[#2E3192] font-medium">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="border-gray-200">
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
                <Label htmlFor="phone" className="text-[#2E3192] font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>

              {/* Conditional fields based on role */}
              {formData.role === 'tenant' && (
                <>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="leaseStartDate" className="text-[#2E3192] font-medium">Lease Start Date</Label>
                    <Input
                      id="leaseStartDate"
                      type="date"
                      value={formData.leaseStartDate}
                      onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                      className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaseEndDate" className="text-[#2E3192] font-medium">Lease End Date</Label>
                    <Input
                      id="leaseEndDate"
                      type="date"
                      value={formData.leaseEndDate}
                      onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                      className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                    />
                  </div>
                </>
              )}

              {formData.role === 'staff' && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="department" className="text-[#2E3192] font-medium">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                  />
                </div>
              )}
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
                {isCreating ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Edit User</DialogTitle>
              <DialogDescription>
                Update user information
              </DialogDescription>
            </DialogHeader>

            {/* Form fields in a 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* First name */}
              <div className="space-y-2">
                <Label htmlFor="editFirstName" className="text-[#2E3192] font-medium">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>

              {/* Last name */}
              <div className="space-y-2">
                <Label htmlFor="editLastName" className="text-[#2E3192] font-medium">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>

              {/* Email */}
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

              {/* Role select */}
              <div className="space-y-2">
                <Label htmlFor="editRole" className="text-[#2E3192] font-medium">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="border-gray-200">
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
                <Label htmlFor="editPhone" className="text-[#2E3192] font-medium">Phone</Label>
                <Input
                  id="editPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                />
              </div>

              {/* Conditional fields based on role */}
              {formData.role === 'tenant' && (
                <>
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

                  <div className="space-y-2">
                    <Label htmlFor="editLeaseStartDate" className="text-[#2E3192] font-medium">Lease Start Date</Label>
                    <Input
                      id="editLeaseStartDate"
                      type="date"
                      value={formData.leaseStartDate}
                      onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                      className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLeaseEndDate" className="text-[#2E3192] font-medium">Lease End Date</Label>
                    <Input
                      id="editLeaseEndDate"
                      type="date"
                      value={formData.leaseEndDate}
                      onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                      className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                    />
                  </div>
                </>
              )}

              {formData.role === 'staff' && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="editDepartment" className="text-[#2E3192] font-medium">Department</Label>
                  <Input
                    id="editDepartment"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                  />
                </div>
              )}
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
                {isUpdating ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" className="border-gray-300" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="bg-[#ED1C24] hover:bg-[#c8161d] text-white" onClick={executeDeleteUser}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}