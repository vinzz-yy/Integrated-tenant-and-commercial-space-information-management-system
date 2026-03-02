import React from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { Building2, DollarSign, FileText, Calendar, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { mockSpaces, mockPayments, mockDocuments, mockSchedules, mockLeases } from '../../data/mockData';

export const TenantDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const mySpace = mockSpaces.find(s => s.tenantId === currentUser?.id);
  const myLease = mockLeases.find(l => l.tenantId === currentUser?.id);
  const myPayments = mockPayments.filter(p => p.tenantId === currentUser?.id).slice(0, 3);
  const myDocuments = mockDocuments.filter(d => d.relatedTo === currentUser?.id);
  const mySchedules = mockSchedules.filter(s => s.participants.includes(currentUser?.id || '')).slice(0, 3);

  const stats = [
    {
      title: 'Current Unit',
      value: mySpace ? `Unit ${mySpace.unitNumber}` : 'N/A',
      icon: Building2,
      color: 'blue',
    },
    {
      title: 'Next Payment',
      value: myPayments.find(p => p.status === 'pending') 
        ? `$${myPayments.find(p => p.status === 'pending')?.amount.toLocaleString()}`
        : 'Paid',
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Documents',
      value: myDocuments.length,
      icon: FileText,
      color: 'purple',
    },
    {
      title: 'Appointments',
      value: mySchedules.length,
      icon: Calendar,
      color: 'orange',
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Tenant Dashboard</h1>
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
                      <p className="text-xl font-semibold text-gray-900 mt-2">{stat.value}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lease Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lease Information</CardTitle>
              </CardHeader>
              <CardContent>
                {mySpace && myLease ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Unit Number</p>
                      <p className="font-semibold text-gray-900">{mySpace.unitNumber}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Floor</p>
                      <p className="font-semibold text-gray-900">{mySpace.floor}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Size</p>
                      <p className="font-semibold text-gray-900">{mySpace.size.toLocaleString()} sq ft</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                      <p className="font-semibold text-gray-900">${myLease.monthlyRent.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Lease Start</p>
                      <p className="font-semibold text-gray-900">{myLease.startDate}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Lease End</p>
                      <p className="font-semibold text-gray-900">{myLease.endDate}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No active lease</p>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment History</CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myPayments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{payment.type}</p>
                        <p className="text-sm text-gray-600">Due: {payment.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${payment.amount.toLocaleString()}</p>
                        <Badge variant={payment.status === 'paid' ? 'success' : 'warning'}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Insurance</span>
                  </div>
                  <Badge variant="success">Current</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900">License</span>
                  </div>
                  <Badge variant="warning">Expiring</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
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
                            <Badge variant="outline" className="mt-1 text-xs">
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

            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle>Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Building Maintenance</p>
                      <p className="text-xs text-gray-600 mt-1">Scheduled for next week</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Bell className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payment Reminder</p>
                      <p className="text-xs text-gray-600 mt-1">Due on March 1st</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};