import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { DollarSign, TrendingUp, FileText, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockInvoices, mockPayments, mockRevenueData } from '../../services/mockData';
import { toast } from 'sonner';

// DJANGO BACKEND INTEGRATION POINT
// Financial Management APIs:
// - GET /api/financial/invoices/ - Fetch invoices
// - POST /api/financial/invoices/ - Create invoice
// - GET /api/financial/payments/ - Fetch payments
// - POST /api/financial/payments/ - Process payment
// - GET /api/financial/revenue-analytics/ - Get revenue data
// - GET /api/financial/reports/profit-loss/ - Get P&L report

export function FinancialManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState(mockInvoices);
  const [payments, setPayments] = useState(mockPayments);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const handleExportReport = () => {
    // DJANGO BACKEND INTEGRATION POINT
    // API Call: GET /api/financial/reports/profit-loss/?format=csv
    // Download CSV/PDF file with financial data
    
    toast.success('Exporting financial report...');
    
    // In a real implementation, you would:
    // 1. Call the API to generate the report
    // 2. Create a download link
    // 3. Trigger file download
    
    // Example implementation:
    // fetch('/api/financial/reports/profit-loss/?format=csv')
    //   .then(response => response.blob())
    //   .then(blob => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);
    //     window.URL.revokeObjectURL(url);
    //     toast.success('Report downloaded successfully');
    //   })
    //   .catch(error => {
    //     console.error('Export failed:', error);
    //     toast.error('Failed to export report');
    //   });
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const unpaidAmount = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Financial Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage invoices, payments, and financial reports
            </p>
          </div>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +8.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Paid Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unpaid Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">${unpaidAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss</CardTitle>
              <CardDescription>Revenue vs Expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Financial Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="invoices">
              <TabsList>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="invoices" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.tenantName}</TableCell>
                        <TableCell>{invoice.unitNumber}</TableCell>
                        <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{invoice.issueDate}</TableCell>
                        <TableCell className="text-sm">{invoice.dueDate}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="payments" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.invoiceId}</TableCell>
                        <TableCell>{payment.tenantName}</TableCell>
                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{payment.paymentDate}</TableCell>
                        <TableCell className="text-sm">{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge>{payment.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}