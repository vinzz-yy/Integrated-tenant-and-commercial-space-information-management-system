import React from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Building2, DollarSign, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockUsers, mockSpaces, mockPayments, mockMaintenanceRequests, getRevenueData, getOccupancyData } from '../../data/mockData';

export const AdminDashboard: React.FC = () => {
  const totalUsers = mockUsers.length;
  const totalSpaces = mockSpaces.length;
  const occupiedSpaces = mockSpaces.filter(s => s.status === 'occupied').length;
  const occupancyRate = ((occupiedSpaces / totalSpaces) * 100).toFixed(1);
  
  const monthlyRevenue = mockPayments
    .filter(p => p.status === 'paid' && p.dueDate.startsWith('2026-03'))
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = mockPayments.filter(p => p.status === 'pending').length;
  
  const openRequests = mockMaintenanceRequests.filter(r => r.status !== 'completed').length;

  const revenueData = getRevenueData();
  const occupancyData = getOccupancyData();

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      icon: Building2,
      color: 'green',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'purple',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Active Alerts',
      value: openRequests + pendingPayments,
      icon: AlertCircle,
      color: 'orange',
      change: '-2',
      trend: 'down'
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            
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
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <div className={`flex items-center gap-1 mt-2 text-sm ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendIcon className="w-4 h-4" />
                        <span>{stat.change}</span>
                      </div>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Space Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPayments.filter(p => p.status === 'pending').slice(0, 5).map(payment => {
                  const tenant = mockUsers.find(u => u.id === payment.tenantId);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{tenant?.name}</p>
                        <p className="text-sm text-gray-600">Due: {payment.dueDate}</p>
                      </div>
                      <span className="font-semibold text-gray-900">${payment.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMaintenanceRequests.filter(r => r.status !== 'completed').slice(0, 5).map(request => {
                  const space = mockSpaces.find(s => s.id === request.spaceId);
                  const priorityColors = {
                    low: 'bg-blue-100 text-blue-700',
                    medium: 'bg-yellow-100 text-yellow-700',
                    high: 'bg-orange-100 text-orange-700',
                    urgent: 'bg-red-100 text-red-700',
                  };
                  
                  return (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{request.title}</p>
                        <p className="text-sm text-gray-600">Unit {space?.unitNumber}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[request.priority]}`}>
                        {request.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};