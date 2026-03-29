import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Download, TrendingUp, FileText, Table as TableIcon, Plus, Search, User } from 'lucide-react';
import connection from '../../connected/connection.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu.jsx';
import { exportToCSV, exportToExcel, exportToWord, exportToDocx, printToPDF } from '../../exporting/export.js';
import { toast } from 'sonner';

export function FinancialManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for financial data
  const [payments, setPayments] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  // Transaction state
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tenant search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Transaction form state
  const [transactionData, setTransactionData] = useState({
    amount: '',
    payment_method: 'cash',
    description: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const loadPayments = async () => {
    try {
      // Fetch invoices, payments, and revenue analytics in parallel
      const [pay, revenue] = await Promise.all([
        connection.financial.getPayments(),
        connection.financial.getRevenueAnalytics({ period: 'month' })
      ]);
      setPayments(Array.isArray(pay) ? pay : (pay?.results || []));
      setRevenueData(revenue.data || []);
    } catch (e) {
      // Set empty arrays on error
      setPayments([]); 
      setRevenueData([]);
    }
  };

  // Initial load - fetch all financial data
  useEffect(() => {
    // Redirect if not admin
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadPayments();
  }, [user, navigate]);

  // Handle tenant search
  useEffect(() => {
    const searchTenants = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const resp = await connection.users.getUsers({ role: 'tenant', search: searchQuery });
        setSearchResults(Array.isArray(resp) ? resp : (resp.results || []));
      } catch (error) {
        console.error('Tenant search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchTenants, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle saving transaction
  const handleSaveTransaction = async () => {
    if (!selectedTenant) {
      toast.error('Please select a tenant');
      return;
    }
    if (!transactionData.amount || isNaN(transactionData.amount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await connection.financial.createPayment({
        user: selectedTenant.id,
        amount: parseFloat(transactionData.amount),
        payment_method: transactionData.payment_method,
        description: transactionData.description,
        status: 'completed',
        payment_date: transactionData.payment_date
      });

      toast.success('Transaction saved successfully');
      setIsTransactionDialogOpen(false);
      resetForm();
      loadPayments();
    } catch (error) {
      toast.error('Failed to save transaction');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTenant(null);
    setSearchQuery('');
    setSearchResults([]);
    setTransactionData({
      amount: '',
      payment_method: 'cash',
      description: '',
      payment_date: new Date().toISOString().split('T')[0]
    });
  };

  // Calculate financial summaries
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const paidAmount = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const unpaidAmount = payments.filter(p => p.status !== 'completed').reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Handle exporting financial report with format choice
  const handleExportReport = async (format) => {
    try {
      // Fetch all financial data
      const [allPayments] = await Promise.all([
          connection.financial.getPayments(),
        ]);
        
        const headers = ['ID', 'Tenant', 'Amount (PHP)', 'Status', 'Date'];
        const paymentsArray = Array.isArray(allPayments) ? allPayments : (allPayments?.results || []);
        const rows = [
          ...paymentsArray.map(pay => [pay.id, pay.tenant_name || '', pay.amount, pay.status, pay.payment_date]),
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

  // Receipt generation logic
  const handleViewReceipt = (payment) => {
    const headers = ['Receipt Item', 'Value'];
    const rows = [
      ['Payment ID', payment.id],
      ['Tenant', payment.tenant_name],
      ['Amount', `₱${payment.amount.toLocaleString('en-PH')}`],
      ['Date', payment.payment_date],
      ['Method', payment.payment_method],
      ['Status', payment.status],
      ['Description', payment.description || 'N/A']
    ];
    printToPDF(headers, rows, `Receipt - ${payment.id}`);
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header with export button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Financial Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage payments, and financial reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsTransactionDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
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
        </div>

        {/* Financial summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString('en-PH')}</div>
              
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Paid Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₱{paidAmount.toLocaleString('en-PH')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Unpaid Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">₱{unpaidAmount.toLocaleString('en-PH')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
            </CardContent>
          </Card>
        </div>


        {/* Financial records table with tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="payments">
              
              
              {/* Payments tab */}
              <TabsContent value="payments" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Amount (PHP)</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.tenant_name}</TableCell>
                        <TableCell>₱{(payment.amount || 0).toLocaleString('en-PH')}</TableCell>
                        <TableCell className="text-sm">{payment.payment_date}</TableCell>
                        <TableCell>{payment.payment_method}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'destructive'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(payment)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Transaction Entry Dialog */}
        <Dialog open={isTransactionDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsTransactionDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New Financial Transaction</DialogTitle>
              <DialogDescription>
                Search for a tenant and enter payment details to save a new transaction.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Tenant Search Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Tenant (Name or ID)</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Start typing to search..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && !selectedTenant && (
                  <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                    {searchResults.map((tenant) => (
                      <div
                        key={tenant.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setSearchQuery(tenant.first_name + ' ' + tenant.last_name);
                          setSearchResults([]);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tenant.first_name} {tenant.last_name}</p>
                            <p className="text-xs text-gray-500">ID: {tenant.id} | {tenant.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{tenant.unitNumber || 'No Unit'}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {isSearching && <p className="text-xs text-gray-500">Searching...</p>}

                {/* Selected Tenant Info */}
                {selectedTenant && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">{selectedTenant.first_name} {selectedTenant.last_name}</p>
                        <p className="text-xs text-blue-700">Unit: {selectedTenant.unitNumber || 'N/A'} | Status: {selectedTenant.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTenant(null)}>Change</Button>
                  </div>
                )}
              </div>

              {/* Transaction Details Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount (PHP)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={transactionData.payment_date}
                    onChange={(e) => setTransactionData({ ...transactionData, payment_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  value={transactionData.payment_method}
                  onValueChange={(val) => setTransactionData({ ...transactionData, payment_method: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Select
                  value={transactionData.description}
                  onValueChange={(val) => setTransactionData({ ...transactionData, description: val })}
                >
                  <SelectTrigger id="description">
                    <SelectValue placeholder="Select description type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly Rent">Monthly Rent</SelectItem>
                    <SelectItem value="Utility Bills">Utility Bills</SelectItem>
                    <SelectItem value="Penalty Fee">Penalty Fee</SelectItem>
                    <SelectItem value="Security Deposit">Security Deposit</SelectItem>
                    <SelectItem value="Advance Rent">Advance Rent</SelectItem>
                    <SelectItem value="Maintenance Fee">Maintenance Fee</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTransaction} disabled={loading}>
                {loading ? 'Saving...' : 'Save Transaction'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
