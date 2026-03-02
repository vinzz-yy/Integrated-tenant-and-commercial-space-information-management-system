import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Calendar, FileCheck, CreditCard, Wrench, Building, ArrowRight } from 'lucide-react';
import { mockInvoices, mockMaintenanceRequests } from '../../services/mockData';

// DJANGO BACKEND INTEGRATION POINT
// Tenant Dashboard APIs:
// - GET /api/dashboard/tenant-stats/?tenant_id={user.id} - Get tenant dashboard stats
// - GET /api/financial/invoices/?tenant_id={user.id}&status=unpaid - Get unpaid invoices
// - GET /api/maintenance/requests/?tenant_id={user.id} - Get maintenance requests

export function TenantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'tenant') navigate('/');
  }, [user, navigate]);

  const myInvoices = mockInvoices.filter(inv => inv.tenantId === user?.id);
  const myRequests = mockMaintenanceRequests.filter(req => req.tenantId === user?.id);

  // Navigation handlers
  const handleMyUnitClick = () => {
    navigate('/tenant/commercial-space');
  };

  const handlePendingPaymentsClick = () => {
    navigate('/tenant/payments');
  };

  const handleMaintenanceRequestsClick = () => {
    navigate('/tenant/maintenance');
  };

  const handleDocumentsClick = () => {
    navigate('/tenant/compliance');
  };

  const handleInvoiceClick = (invoiceId: string) => {
    navigate('/tenant/payments');
  };

  const handleMaintenanceRequestClick = (requestId: string) => {
    navigate('/tenant/maintenance');
  };

  return (
    <Layout role="tenant">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenant Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome, {user?.firstName}! Unit {user?.unitNumber}
          </p>
        </div>

        {/* Stats Cards - All Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* My Unit Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800"
            onClick={handleMyUnitClick}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
                My Unit
                <Building className="h-4 w-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.unitNumber || 'A-105'}</div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                Commercial Space
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>

          {/* Pending Payments Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800"
            onClick={handlePendingPaymentsClick}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
                Pending Payments
                <CreditCard className="h-4 w-4 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${myInvoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                {myInvoices.filter(inv => inv.status === 'unpaid').length} unpaid invoice(s)
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>

          {/* Maintenance Requests Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800"
            onClick={handleMaintenanceRequestsClick}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
                Maintenance Requests
                <Wrench className="h-4 w-4 text-orange-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myRequests.length}</div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                {myRequests.filter(req => req.status === 'pending').length} pending
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>

          {/* Documents Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800"
            onClick={handleDocumentsClick}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
                Documents
                <FileCheck className="h-4 w-4 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                Compliance documents
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices and Maintenance Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Your recent billing statements</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/tenant/payments')} className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myInvoices.slice(0, 3).map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleInvoiceClick(invoice.id)}
                  >
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{invoice.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Due: {invoice.dueDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : 'destructive'} 
                        className="mt-1 cursor-pointer"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {myInvoices.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No invoices found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Maintenance Requests Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Maintenance Requests</CardTitle>
                <CardDescription>Track your maintenance requests</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/tenant/maintenance')} className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myRequests.slice(0, 3).map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleMaintenanceRequestClick(request.id)}
                  >
                    <Wrench className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{request.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {request.createdAt}
                      </p>
                      <Badge 
                        variant={request.status === 'completed' ? 'default' : 'secondary'} 
                        className="mt-2 cursor-pointer"
                      >
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {myRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No maintenance requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}