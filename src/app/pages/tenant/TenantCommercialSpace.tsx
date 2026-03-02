import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Building,
  MapPin,
  Maximize,
  Calendar,
  DollarSign,
  Home,
  Search,
  Eye,
  Grid,
  List,
  X,
} from 'lucide-react';
import { mockCommercialUnits } from '../../services/mockData';

// DJANGO BACKEND INTEGRATION POINT
// Tenant Commercial Space APIs:
// - GET /api/commercial-spaces/units/?tenant_id={user.id} - Get tenant's assigned unit(s)
// - GET /api/commercial-spaces/units/{unit_id}/ - Get specific unit details
// - GET /api/commercial-spaces/available/ - Get all available units for marketplace

export function TenantCommercialSpace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myUnit, setMyUnit] = useState<any>(null);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (user?.role !== 'tenant') {
      navigate('/');
      return;
    }

    // DJANGO BACKEND INTEGRATION POINT
    // Fetch tenant's assigned unit from backend
    // API Call: GET /api/commercial-spaces/units/?tenant_id=${user.id}
    
    // Fetch available units for marketplace
    // API Call: GET /api/commercial-spaces/available/
    
    // For now, using mock data
    const assigned = mockCommercialUnits.find(unit => unit.tenantId === user?.id);
    setMyUnit(assigned);
    
    // Get all units that are available or occupied by others for marketplace
    const available = mockCommercialUnits.filter(unit => unit.tenantId !== user?.id);
    setAvailableUnits(available);
    setFilteredUnits(available);
  }, [user, navigate]);

  // Filter available units based on search
  useEffect(() => {
    let filtered = availableUnits;
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(unit =>
        unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.floor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (unit.size && unit.size.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredUnits(filtered);
  }, [searchQuery, availableUnits]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40';
      case 'occupied':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40';
      case 'maintenance':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/40';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Layout role="tenant">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Commercial Spaces
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View your assigned unit and browse available commercial spaces
          </p>
        </div>

        <Tabs defaultValue="my-unit" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-unit">My Unit</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>

          {/* My Unit Tab */}
          <TabsContent value="my-unit" className="space-y-6">
            {myUnit ? (
              <>
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Unit Number
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{myUnit.unitNumber}</div>
                      <p className="text-xs text-gray-500 mt-1">Your assigned unit</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Floor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{myUnit.floor}</div>
                      <p className="text-xs text-gray-500 mt-1">Floor level</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Size
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{myUnit.size}</div>
                      <p className="text-xs text-gray-500 mt-1">Total area</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Monthly Rent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        ${myUnit.rentalRate?.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Base rental rate</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Unit Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Unit Details</CardTitle>
                    <CardDescription>Complete information about your commercial space</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Column - Unit Specifications */}
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                            <Building className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Unit Type
                            </p>
                            <p className="text-xl font-semibold mt-1">{myUnit.type}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                            <MapPin className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Location
                            </p>
                            <p className="text-xl font-semibold mt-1">
                              Floor {myUnit.floor}, Unit {myUnit.unitNumber}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                            <Maximize className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Total Area
                            </p>
                            <p className="text-xl font-semibold mt-1">{myUnit.size}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Lease & Status */}
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                            <DollarSign className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Monthly Rental Rate
                            </p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">
                              ${myUnit.rentalRate?.toLocaleString()}
                              <span className="text-sm font-normal text-gray-500 ml-1">/month</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
                            <Home className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Status
                            </p>
                            <div className="mt-1">
                              <Badge 
                                variant={myUnit.status === 'occupied' ? 'default' : 'secondary'}
                                className="text-sm px-4 py-1 capitalize"
                              >
                                {myUnit.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lease Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lease Information</CardTitle>
                    <CardDescription>Your current lease period and terms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Start Date
                          </p>
                        </div>
                        <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                          {formatDate(myUnit.leaseStartDate)}
                        </p>
                      </div>

                      <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            End Date
                          </p>
                        </div>
                        <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
                          {formatDate(myUnit.leaseEndDate)}
                        </p>
                      </div>

                      <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Security Deposit
                          </p>
                        </div>
                        <p className="text-xl font-bold text-green-700 dark:text-green-400">
                          ${myUnit.securityDeposit?.toLocaleString() || '2,500'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No commercial unit assigned</p>
                    <p className="text-sm mt-1">Browse available units in the Marketplace tab</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Commercial Spaces</CardTitle>
                    <CardDescription>
                      Browse and view available units for lease
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar with Clear Button */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by unit number, type, or floor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-500">
                  Showing {filteredUnits.length} of {availableUnits.length} units
                </div>

                {/* Available Units */}
                {filteredUnits.length > 0 ? (
                  viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredUnits.map((unit) => (
                        <Card key={unit.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-0">
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold text-lg">{unit.unitNumber}</h3>
                                  <p className="text-sm text-gray-500">{unit.type}</p>
                                </div>
                                <Badge className={getStatusColor(unit.status)}>
                                  {unit.status}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>Floor {unit.floor}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Maximize className="h-4 w-4 text-gray-400" />
                                  <span>{unit.size}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="h-4 w-4 text-gray-400" />
                                  <span className="font-semibold text-blue-600">
                                    ${unit.rentalRate?.toLocaleString()}/mo
                                  </span>
                                </div>
                              </div>

                              <Button 
                                variant="outline" 
                                className="w-full gap-2"
                                onClick={() => {
                                  setSelectedUnit(unit);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    // List View
                    <div className="space-y-3">
                      {filteredUnits.map((unit) => (
                        <div
                          key={unit.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex-1 grid grid-cols-5 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Unit</p>
                              <p className="font-semibold">{unit.unitNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Type</p>
                              <p>{unit.type}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Floor</p>
                              <p>{unit.floor}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Size</p>
                              <p>{unit.size}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Rent</p>
                              <p className="font-semibold text-blue-600">
                                ${unit.rentalRate?.toLocaleString()}/mo
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUnit(unit);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No units found</p>
                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                    {searchQuery && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={clearSearch}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Unit Details</DialogTitle>
              <DialogDescription>
                Complete information about this commercial space
              </DialogDescription>
            </DialogHeader>
            {selectedUnit && (
              <div className="space-y-6 py-4">
                {/* Header with Unit Number and Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedUnit.unitNumber}</h3>
                    <p className="text-sm text-gray-500">{selectedUnit.type}</p>
                  </div>
                  <Badge className={getStatusColor(selectedUnit.status)}>
                    {selectedUnit.status}
                  </Badge>
                </div>

                {/* Unit Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Floor</p>
                    <p className="font-semibold">{selectedUnit.floor}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Size</p>
                    <p className="font-semibold">{selectedUnit.size}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Monthly Rent</p>
                    <p className="font-semibold text-blue-600">
                      ${selectedUnit.rentalRate?.toLocaleString()}/mo
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Security Deposit</p>
                    <p className="font-semibold">
                      ${selectedUnit.securityDeposit?.toLocaleString() || '2,500'}
                    </p>
                  </div>
                </div>

                {/* Lease Information */}
                {(selectedUnit.leaseStartDate || selectedUnit.leaseEndDate) && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Lease Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedUnit.leaseStartDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Start Date</p>
                          <p className="font-semibold">{formatDate(selectedUnit.leaseStartDate)}</p>
                        </div>
                      )}
                      {selectedUnit.leaseEndDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">End Date</p>
                          <p className="font-semibold">{formatDate(selectedUnit.leaseEndDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Amenities/Features if available */}
                {selectedUnit.amenities && selectedUnit.amenities.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUnit.amenities.map((amenity: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}