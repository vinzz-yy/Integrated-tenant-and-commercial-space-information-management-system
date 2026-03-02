import React from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { mockMaintenanceRequests, mockSchedules, mockDocuments, mockSpaces } from '../../data/mockData';

export const StaffDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const myTasks = mockMaintenanceRequests.filter(
    r => r.assignedTo === currentUser?.id && r.status !== 'completed'
  );

  const mySchedules = mockSchedules.filter(
    s => s.participants.includes(currentUser?.id || '') && s.status === 'scheduled'
  ).slice(0, 5);

  const pendingDocuments = mockDocuments.filter(d => d.status === 'pending');

  const stats = [
    {
      title: 'Assigned Tasks',
      value: myTasks.length,
      icon: ClipboardList,
      color: 'blue',
    },
    {
      title: 'Today\'s Schedule',
      value: mySchedules.filter(s => {
        const today = new Date().toDateString();
        return new Date(s.startTime).toDateString() === today;
      }).length,
      icon: Calendar,
      color: 'green',
    },
    {
      title: 'Pending Docs',
      value: pendingDocuments.length,
      icon: FileText,
      color: 'orange',
    },
    {
      title: 'Completed Today',
      value: mockMaintenanceRequests.filter(r => 
        r.assignedTo === currentUser?.id && 
        r.completedAt === new Date().toISOString().split('T')[0]
      ).length,
      icon: CheckCircle,
      color: 'purple',
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {currentUser?.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            
            const iconBgColors: { [key: string]: string } = {
              blue: 'bg-blue-100',
              green: 'bg-green-100',
              purple: 'bg-purple-100',
              orange: 'bg-orange-100',
            };
            
            const iconTextColors: { [key: string]: string } = {
              blue: 'text-blue-600',
              green: 'text-green-600',
              purple: 'text-purple-600',
              orange: 'text-orange-600',
            };
            
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${iconBgColors[stat.color]} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${iconTextColors[stat.color]}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myTasks.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No tasks assigned</p>
                ) : (
                  myTasks.map(task => {
                    const space = mockSpaces.find(s => s.id === task.spaceId);
                    const priorityColors: { [key: string]: string } = {
                      low: 'bg-blue-100 text-blue-700',
                      medium: 'bg-yellow-100 text-yellow-700',
                      high: 'bg-orange-100 text-orange-700',
                      urgent: 'bg-red-100 text-red-700',
                    };

                    return (
                      <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            <p className="text-sm text-gray-500 mt-2">Unit {space?.unitNumber}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <Badge variant="warning">{task.status}</Badge>
                          <Button variant="outline" size="sm">Update</Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mySchedules.map(schedule => {
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

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Safety Training</p>
                      <p className="text-xs text-gray-600">Valid until Dec 2026</p>
                    </div>
                  </div>
                  <Badge variant="success">Current</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Background Check</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                  </div>
                  <Badge variant="success">Verified</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">Annual Review</p>
                      <p className="text-xs text-gray-600">Due in 30 days</p>
                    </div>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Completed HVAC maintenance</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Submitted inspection report</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Updated space status</p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};