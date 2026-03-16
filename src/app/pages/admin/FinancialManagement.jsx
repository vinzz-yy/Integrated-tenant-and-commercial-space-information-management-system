// FinancialManagement.jsx - Admin panel for managing financial records
// Displays invoices, payments, revenue charts, and allows exporting financial reports

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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
import { Download, TrendingUp, FileText, Table as TableIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { exportToCSV, exportToExcel, exportToWord, exportToDocx, printToPDF } from '../../utils/export.js';

export function FinancialManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for financial data
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  // Initial load - fetch all financial data
  useEffect(() => {
    // Redirect if not admin
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const load = async () => {
      try {
        // Fetch invoices, payments, and revenue analytics in parallel
        const inv = await api.financial.getInvoices();
        setInvoices(inv.results || []);
        
        const pay = await api.financial.getPayments();
        setPayments(pay.results || []);
        
        const revenue = await api.financial.getRevenueAnalytics({ period: 'month' });
        setRevenueData(revenue.data || []);
      } catch (e) {
        // Set empty arrays on error
        setInvoices([]); 
        setPayments([]); 
        setRevenueData([]);
      }
    };
    load();
  }, [user, navigate]);

  // Calculate financial summaries
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const unpaidAmount = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + (inv.amount || 0), 0);

  // Handle exporting financial report with format choice
  const handleExportReport = async (format) => {
    try {
      // Fetch all financial data
      const allInvoices = await api.financial.getInvoices();
      const allPayments = await api.financial.getPayments();
      
      const headers = ['Type', 'ID', 'Amount (PHP)', 'Status', 'Date'];
      const rows = [
        ...(allInvoices.results || []).map(inv => ['Invoice', inv.id, inv.amount, inv.status, inv.created_at]),
        ...(allPayments.results || []).map(pay => ['Payment', pay.id, pay.amount, 'completed', pay.created_at]),
      ];

      if (format === 'csv') {
        exportToCSV(headers, rows, 'financial_report.csv');
      } else if (format === 'excel') {
        exportToExcel(headers, rows, 'financial_report.xls', 'Financial Report');
      } else if (format === 'word') {
        exportToWord(headers, rows, 'financial_report.doc', 'Financial Report');
      } else if (format === 'docx') {
        await exportToDocx(headers, rows, 'financial_report.docx', 'Financial Report');
      } else if (format === 'pdf') {
        printToPDF(headers, rows, 'Financial Report');
      }
    } catch (error) {
      console.error('Error exporting financial report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header with export button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Financial Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage invoices, payments, and financial reports
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportReport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                PDF (Print)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport('word')}>
                <FileText className="h-4 w-4 mr-2" />
                Word (.doc)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport('docx')}>
                <FileText className="h-4 w-4 mr-2" />
                Word (.docx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport('excel')}>
                <TableIcon className="h-4 w-4 mr-2" />
                Excel (.xls)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport('csv')}>
                <TableIcon className="h-4 w-4 mr-2" />
                CSV (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Financial summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
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
              <div className="text-2xl font-bold text-green-600">₱{paidAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unpaid Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">₱{unpaidAmount.toLocaleString()}</div>
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

        {/* Revenue chart */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss</CardTitle>
              <CardDescription>Revenue vs Expenses (PHP)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Financial records table with tabs */}
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
              
              {/* Invoices tab */}
              <TabsContent value="invoices" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Amount (PHP)</TableHead>
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
                        <TableCell>₱{(invoice.amount || 0).toLocaleString()}</TableCell>
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

              {/* Payments tab */}
              <TabsContent value="payments" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Amount (PHP)</TableHead>
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
                        <TableCell>₱{(payment.amount || 0).toLocaleString()}</TableCell>
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
