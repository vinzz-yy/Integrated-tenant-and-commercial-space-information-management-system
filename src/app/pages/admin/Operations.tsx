import React, { useState } from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { mockMaintenanceRequests, mockUsers, mockSpaces, mockSchedules } from '../../data/mockData';

export const AdminOperations: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRequests = mockMaintenanceRequests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'secondary' | 'warning' | 'success' | 'destructive' } = {
      open: 'secondary',
      'in-progress': 'warning',
      completed: 'success',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
  ];

  const upcomingSchedules = mockSchedules
    .filter(s => s.status === 'scheduled')
    .slice(0, 5);

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Operations Management</h1>
            <p className="text-gray-600 mt-1">Maintenance requests and work orders</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Requests</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">
                    {mockMaintenanceRequests.filter(r => r.status === 'open').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-3xl font-semibold text-orange-600 mt-2">
                    {mockMaintenanceRequests.filter(r => r.status === 'in-progress').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-semibold text-green-600 mt-2">
                    {mockMaintenanceRequests.filter(r => r.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgent</p>
                  <p className="text-3xl font-semibold text-red-600 mt-2">
                    {mockMaintenanceRequests.filter(r => r.priority === 'urgent').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Maintenance Requests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle>Maintenance Requests ({filteredRequests.length})</CardTitle>
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
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-48"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRequests.map(request => {
                    const space = mockSpaces.find(s => s.id === request.spaceId);
                    const reporter = mockUsers.find(u => u.id === request.reportedBy);
                    const assignee = request.assignedTo ? mockUsers.find(u => u.id === request.assignedTo) : null;

                    return (
                      <div key={request.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900">{request.title}</h3>
                              {getPriorityBadge(request.priority)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Unit {space?.unitNumber}</span>
                              <span>•</span>
                              <span>Reported by {reporter?.name}</span>
                              {assignee && (
                                <>
                                  <span>•</span>
                                  <span>Assigned to {assignee.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500">Created: {request.createdAt}</span>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Schedule */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingSchedules.map(schedule => {
                    const date = new Date(schedule.startTime);
                    const timeStr = date.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });
                    const dateStr = date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    });

                    return (
                      <div key={schedule.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="text-center min-w-[50px]">
                            <p className="text-xs text-gray-500">{dateStr}</p>
                            <p className="text-sm font-medium text-gray-900">{timeStr}</p>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{schedule.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{schedule.location}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {schedule.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Create Work Order
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Schedule Inspection
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Assign Task
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
