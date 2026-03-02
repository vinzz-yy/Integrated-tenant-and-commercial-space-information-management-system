import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
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
import { Search, Plus, Edit, Trash2, Building, Users } from 'lucide-react';
import { toast } from 'sonner';
import { mockCommercialUnits } from '../../services/mockData';

// DJANGO BACKEND INTEGRATION POINT
// Commercial Space Management APIs:
// - GET /api/commercial-spaces/units/ - Fetch all units
// - POST /api/commercial-spaces/units/ - Create new unit
// - PATCH /api/commercial-spaces/units/{id}/ - Update unit
// - DELETE /api/commercial-spaces/units/{id}/ - Delete unit
// - POST /api/commercial-spaces/units/{id}/assign-tenant/ - Assign tenant to unit

export function CommercialSpaceManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [units, setUnits] = useState(mockCommercialUnits);
  const [filteredUnits, setFilteredUnits] = useState(mockCommercialUnits);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    unitNumber: '',
    floor: 1,
    size: 0,
    type: 'Retail',
    rentalRate: 0,
    status: 'available',
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    let filtered = units;
    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.tenantName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }
    setFilteredUnits(filtered);
  }, [searchQuery, statusFilter, units]);

  const handleCreateUnit = () => {
    // DJANGO BACKEND INTEGRATION POINT
    // API Call: POST /api/commercial-spaces/units/
    const newUnit = {
      id: String(units.length + 1),
      ...formData,
      tenantId: null,
      tenantName: null,
      leaseStartDate: null,
      leaseEndDate: null,
    };
    setUnits([...units, newUnit]);
    toast.success('Unit created successfully');
    setIsCreateDialogOpen(false);
  };

  const handleDeleteUnit = (id: string) => {
    // DJANGO BACKEND INTEGRATION POINT
    // API Call: DELETE /api/commercial-spaces/units/{id}/
    if (confirm('Are you sure you want to delete this unit?')) {
      setUnits(units.filter(u => u.id !== id));
      toast.success('Unit deleted');
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'occupied': return 'default';
      case 'available': return 'secondary';
      case 'reserved': return 'outline';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Commercial Space Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all commercial units and tenants
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{units.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Occupancy Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((units.filter(u => u.status === 'occupied').length / units.length) * 100)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by unit or tenant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Commercial Units ({filteredUnits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Number</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Size (sqm)</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rental Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                    <TableCell>{unit.floor}</TableCell>
                    <TableCell>{unit.size}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{unit.type}</Badge>
                    </TableCell>
                    <TableCell>${unit.rentalRate.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(unit.status)}>
                        {unit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {unit.tenantName || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
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
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Size (sqm)</Label>
                  <Input
                    type="number"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rental Rate ($)</Label>
                  <Input
                    type="number"
                    value={formData.rentalRate}
                    onChange={(e) => setFormData({ ...formData, rentalRate: parseFloat(e.target.value) })}
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
      </div>
    </Layout>
  );
}
