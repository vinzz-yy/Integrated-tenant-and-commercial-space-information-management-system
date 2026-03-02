import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
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
import { Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for commercial units
const mockCommercialUnits = [
  {
    id: '1',
    unitNumber: 'A-101',
    floor: '1st Floor',
    size: '120 sqm',
    type: 'Retail',
    status: 'occupied',
    tenantName: 'John Tenant',
    monthlyRent: 2500,
    leaseStart: '2026-01-01',
    leaseEnd: '2026-12-31',
  },
  {
    id: '2',
    unitNumber: 'A-102',
    floor: '1st Floor',
    size: '95 sqm',
    type: 'Office',
    status: 'available',
    tenantName: null,
    monthlyRent: 1800,
    leaseStart: null,
    leaseEnd: null,
  },
  {
    id: '3',
    unitNumber: 'B-201',
    floor: '2nd Floor',
    size: '150 sqm',
    type: 'Restaurant',
    status: 'maintenance',
    tenantName: 'Sarah Jones',
    monthlyRent: 3200,
    leaseStart: '2025-06-01',
    leaseEnd: '2026-05-31',
  },
  {
    id: '4',
    unitNumber: 'B-202',
    floor: '2nd Floor',
    size: '85 sqm',
    type: 'Office',
    status: 'occupied',
    tenantName: 'Mike Wilson',
    monthlyRent: 1650,
    leaseStart: '2026-02-01',
    leaseEnd: '2027-01-31',
  },
  {
    id: '5',
    unitNumber: 'C-301',
    floor: '3rd Floor',
    size: '200 sqm',
    type: 'Retail',
    status: 'available',
    tenantName: null,
    monthlyRent: 3800,
    leaseStart: null,
    leaseEnd: null,
  }
];

export function StaffCommercialSpace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [units, setUnits] = useState(mockCommercialUnits);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  useEffect(() => {
    if (user?.role !== 'staff') navigate('/');
  }, [user, navigate]);

  const openEditDialog = (unit: any) => {
    setSelectedUnit(unit);
    setFormData({
      unitNumber: unit.unitNumber,
      floor: unit.floor,
      size: unit.size,
      type: unit.type,
      status: unit.status,
      tenantName: unit.tenantName || '',
      monthlyRent: unit.monthlyRent?.toString() || '',
      leaseStart: unit.leaseStart || '',
      leaseEnd: unit.leaseEnd || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUnit = () => {
    // Validate form
    if (!formData.unitNumber || !formData.floor || !formData.size || !formData.type || !formData.status) {
      toast.error('Please fill in all required fields');
      return;
    }

 
    toast.success('Unit updated successfully');
    setIsEditDialogOpen(false);
  };

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'occupied':
        return 'default';
      case 'available':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Commercial Units
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and edit commercial space units
          </p>
        </div>

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
                  <TableHead>Size (sqm)</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                    <TableCell>{unit.floor}</TableCell>
                    <TableCell>{unit.size}</TableCell>
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
                    <TableCell>{unit.tenantName || '-'}</TableCell>
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
                <div className="space-y-2">
                  <Label htmlFor="unitNumber">Unit Number *</Label>
                  <Input
                    id="unitNumber"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    placeholder="e.g., A-101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor *</Label>
                  <Input
                    id="floor"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="e.g., 1st Floor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size (sqm) *</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g., 120 sqm"
                  />
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Tenant Name</Label>
                  <Input
                    id="tenantName"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                    placeholder="Tenant name (if occupied)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                    placeholder="Monthly rent amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaseStart">Lease Start Date</Label>
                  <Input
                    id="leaseStart"
                    type="date"
                    value={formData.leaseStart}
                    onChange={(e) => setFormData({ ...formData, leaseStart: e.target.value })}
                  />
                </div>
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