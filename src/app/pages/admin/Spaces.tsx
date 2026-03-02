import React, { useState } from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, Eye, Edit } from 'lucide-react';
import { mockSpaces, mockUsers } from '../../data/mockData';
import { CommercialSpace } from '../../types';

export const AdminSpaces: React.FC = () => {
  const [spaces, setSpaces] = useState<CommercialSpace[]>(mockSpaces);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = 
      space.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || space.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'success' | 'secondary' | 'warning' | 'destructive' } = {
      occupied: 'success',
      vacant: 'secondary',
      reserved: 'warning',
      maintenance: 'destructive',
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getTenant = (tenantId?: string) => {
    if (!tenantId) return '-';
    const tenant = mockUsers.find(u => u.id === tenantId);
    return tenant?.name || '-';
  };

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Occupied', value: 'occupied' },
    { label: 'Vacant', value: 'vacant' },
    { label: 'Reserved', value: 'reserved' },
    { label: 'Maintenance', value: 'maintenance' },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Commercial Spaces</h1>
            <p className="text-gray-600 mt-1">Manage commercial units and assignments</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Space
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Total Spaces</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">{spaces.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-3xl font-semibold text-green-600 mt-2">
                {spaces.filter(s => s.status === 'occupied').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Vacant</p>
              <p className="text-3xl font-semibold text-gray-600 mt-2">
                {spaces.filter(s => s.status === 'vacant').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Total Area</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {spaces.reduce((sum, s) => sum + s.size, 0).toLocaleString()} sq ft
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>Space Inventory ({filteredSpaces.length})</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {statusFilters.map(filter => (
                    <Button
                      key={filter.value}
                      variant={filterStatus === filter.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus(filter.value)}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search spaces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Unit #</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Floor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Size</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rent/Month</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tenant</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Lease End</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSpaces.map((space) => (
                    <tr key={space.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{space.unitNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{space.floor}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 capitalize">{space.type}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{space.size.toLocaleString()} sq ft</td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        ${space.rentalRate.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(space.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{getTenant(space.tenantId)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{space.leaseEnd || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
