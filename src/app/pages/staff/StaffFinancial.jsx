import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Download, FileText, CheckCircle, XCircle, Clock, Table as TableIcon, Plus, Search, User, Trash2, Eye } from 'lucide-react';
import connection from '../../connected/connection.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu.jsx';
import { exportToCSV, exportToExcel, exportToWord, exportToDocx, printToPDF } from '../../exporting/export.js';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { toast } from 'sonner';

export function StaffFinancial() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState([]);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [transactionData, setTransactionData] = useState({
    amount: '',
    payment_method: 'cash',
    description: 'Monthly Rent',
    payment_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.role !== 'staff') navigate('/');
  }, [user, navigate]);

  const loadPayments = async () => {
    try {
      const pay = await connection.financial.getPayments();
      setPayments(Array.isArray(pay) ? pay : (pay?.results || []));
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

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

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      try {
        await connection.financial.deletePayment(paymentId);
        toast.success('Payment record deleted successfully');
        loadPayments();
      } catch (error) {
        console.error('Failed to delete payment:', error);
        toast.error('Failed to delete payment record');
      }
    }
  };

  const resetForm = () => {
    setSelectedTenant(null);
    setSearchQuery('');
    setSearchResults([]);
    setTransactionData({
      amount: '',
      payment_method: 'cash',
      description: 'Monthly Rent',
      payment_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleExport = async (format) => {
    try {
      const headers = ['Payment ID', 'Tenant', 'Amount', 'Payment Date', 'Method', 'Status', 'Description'];
      const rows = payments.map(pay => [
        pay.id,
        pay.tenant_name || '',
        pay.amount,
        pay.payment_date,
        pay.payment_method,
        pay.status,
        pay.description || ''
      ]);
      if (format === 'csv') {
        exportToCSV(headers, rows, 'staff_payments.csv');
      } else if (format === 'excel') {
        exportToExcel(headers, rows, 'staff_payments.xls', 'Payments');
      } else if (format === 'word') {
        exportToWord(headers, rows, 'staff_payments.doc', 'Payments');
      } else if (format === 'docx') {
        await exportToDocx(headers, rows, 'staff_payments.docx', 'Payments');
      } else if (format === 'pdf') {
        printToPDF(headers, rows, 'Payments');
      }
    } catch (e) {
      alert('Failed to export. Please try again.');
    }
  };

  const handleViewReceipt = (payment) => {
    const headers = ['Receipt Item', 'Value'];
    const rows = [
      ['Payment ID', payment.id],
      ['Tenant', payment.tenant_name],
      ['Amount', `₱${payment.amount.toLocaleString()}`],
      ['Date', payment.payment_date],
      ['Method', payment.payment_method],
      ['Status', payment.status],
      ['Description', payment.description || 'N/A']
    ];
    printToPDF(headers, rows, `Receipt - ${payment.id}`);
  };

  // Kept from first code, enhanced with brand colors from second code
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      default:
        return <XCircle className="h-3 w-3 mr-1" />;
    }
  };

  // Replaced with brand-color system from second code
  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return { className: 'bg-[#2E3192] text-white hover:bg-[#2E3192]/90' };
    } else if (status === 'pending') {
      return { className: 'bg-[#F9E81B]/30 text-[#2E3192] hover:bg-[#F9E81B]/40' };
    } else {
      return { className: 'bg-[#ED1C24] text-white hover:bg-[#ED1C24]/90' };
    }
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        {/* Header with export and add button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2E3192]">
              Financial Overview
            </h1>
            <p className="text-gray-600 mt-1">Manage and track all payment transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-300">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF (Print)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('word')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Word (.doc)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('docx')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Word (.docx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <TableIcon className="h-4 w-4 mr-2" />
                  Excel (.xls)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <TableIcon className="h-4 w-4 mr-2" />
                  CSV (.csv)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => setIsTransactionDialogOpen(true)}
              className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>
        
        {/* Payments table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#2E3192]">Payments ({payments.length})</CardTitle>
            <CardDescription>All recorded payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-10 w-10 mx-auto mb-3 text-[#2E3192]/30" />
                <p className="font-medium text-[#2E3192]">No transactions recorded</p>
                <p className="text-sm text-gray-500 mt-1">Add your first transaction to get started</p>
              </div>
            ) : (
              <div className="rounded-md border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-[#2E3192] font-semibold">Payment ID</TableHead>
                      <TableHead className="text-[#2E3192] font-semibold">Tenant</TableHead>
                      <TableHead className="text-[#2E3192] font-semibold">Amount</TableHead>
                      <TableHead className="text-[#2E3192] font-semibold">Payment Date</TableHead>
                      <TableHead className="text-[#2E3192] font-semibold">Method</TableHead>
                      <TableHead className="text-[#2E3192] font-semibold">Status</TableHead>
                      <TableHead className="text-right text-[#2E3192] font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => {
                      const statusBadge = getStatusBadge(payment.status);
                      return (
                        <TableRow key={payment.id} className="hover:bg-[#F9E81B]/5">
                          <TableCell className="font-medium">{payment.id}</TableCell>
                          <TableCell>{payment.tenant_name}</TableCell>
                          <TableCell>₱{(payment.amount || 0).toLocaleString()}</TableCell>
                          <TableCell>{payment.payment_date}</TableCell>
                          <TableCell>{payment.payment_method}</TableCell>
                          <TableCell>
                            <Badge className={`flex items-center gap-1 w-fit ${statusBadge.className}`}>
                              {getStatusIcon(payment.status)}
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPayment(payment)}
                                className="border-gray-300"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4 text-[#2E3192]" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewReceipt(payment)}
                                className="border-gray-300"
                                title="Receipt"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 hover:bg-red-50 text-red-600"
                                onClick={() => handleDeletePayment(payment.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Entry Dialog */}
        <Dialog open={isTransactionDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsTransactionDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">New Financial Transaction</DialogTitle>
              <DialogDescription>
                Search for a tenant and enter payment details to save a new transaction.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Tenant Search Section */}
              <div className="space-y-2">
                <Label className="text-[#2E3192] font-medium">
                  Search Tenant (Name or ID) <span className="text-[#ED1C24]">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Start typing to search..."
                    className="pl-9 border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && !selectedTenant && (
                <div className="border border-gray-200 rounded-md divide-y max-h-[200px] overflow-y-auto">
                  {searchResults.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="p-3 hover:bg-[#F9E81B]/10 cursor-pointer flex items-center justify-between transition-colors"
                      onClick={async () => {
                        setSelectedTenant(tenant);
                        setSearchQuery(tenant.first_name + ' ' + tenant.last_name);
                        setSearchResults([]);
                        
                        // Autocomplete the payment amount using the commercial unit rental rate
                        try {
                          const unitsResp = await connection.commercialSpace.getUnits({ tenant_id: tenant.id });
                          const units = Array.isArray(unitsResp) ? unitsResp : (unitsResp.results || []);
                          const tenantUnit = units.find(u => String(u.tenant) === String(tenant.id)) || units[0];
                          if (tenantUnit && (tenantUnit.rental_rate || tenantUnit.rentalRate)) {
                             const rate = tenantUnit.rental_rate || tenantUnit.rentalRate;
                             setTransactionData(prev => ({ ...prev, amount: String(rate) }));
                          } else {
                             // Ensure amount isn't overwritten if not found, or clear it
                             setTransactionData(prev => ({ ...prev, amount: '' }));
                          }
                        } catch (err) {
                          console.error('Failed to fetch tenant unit for amount auto-fill', err);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#F9E81B] flex items-center justify-center">
                          <User className="h-4 w-4 text-[#2E3192]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2E3192]">{tenant.first_name} {tenant.last_name}</p>
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
                <div className="p-4 bg-[#F9E81B]/10 border border-[#F9E81B] rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#F9E81B] flex items-center justify-center">
                      <User className="h-5 w-5 text-[#2E3192]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2E3192]">{selectedTenant.first_name} {selectedTenant.last_name}</p>
                      <p className="text-xs text-gray-500">Unit: {selectedTenant.unitNumber || 'N/A'} | Status: {selectedTenant.role}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTenant(null)}
                    className="text-[#2E3192]"
                  >
                    Change
                  </Button>
                </div>
              )}

              {/* Transaction Details Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-[#2E3192] font-medium">
                    Payment Amount (PHP) <span className="text-[#ED1C24]">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="border-gray-200"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[#2E3192] font-medium">
                    Payment Date <span className="text-[#ED1C24]">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="border-gray-200"
                    value={transactionData.payment_date}
                    onChange={(e) => setTransactionData({ ...transactionData, payment_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method" className="text-[#2E3192] font-medium">
                  Payment Method <span className="text-[#ED1C24]">*</span>
                </Label>
                <Select
                  value={transactionData.payment_method}
                  onValueChange={(val) => setTransactionData({ ...transactionData, payment_method: val })}
                >
                  <SelectTrigger className="border-gray-200">
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
                <Label htmlFor="description" className="text-[#2E3192] font-medium">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g. Monthly Rent"
                  className="border-gray-200"
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)} className="border-gray-300">
                Cancel
              </Button>
              <Button
                onClick={handleSaveTransaction}
                disabled={loading}
                className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold"
              >
                {loading ? 'Saving...' : 'Save Transaction'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Payment Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#2E3192]">Payment Details</DialogTitle>
              <DialogDescription>View complete information for this transaction</DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                    <p className="font-semibold text-[#2E3192]">{selectedPayment.id}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="flex justify-end">
                      <Badge className={getStatusBadge(selectedPayment.status).className}>
                          <span className="flex items-center">
                            {getStatusIcon(selectedPayment.status)}
                            {selectedPayment.status}
                          </span>
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Tenant / Customer</p>
                    <p className="font-semibold text-[#2E3192]">{selectedPayment.tenant_name || 'Unknown'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm font-medium text-gray-500">Payment Date</p>
                    <p className="font-medium text-gray-800">{selectedPayment.payment_date}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize text-gray-800">{selectedPayment.payment_method?.replace('_', ' ')}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="font-medium text-gray-800">{selectedPayment.description}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="bg-[#2E3192]/5 p-4 rounded-lg flex justify-between items-center border border-[#2E3192]/10">
                    <p className="font-medium text-[#2E3192]">Total Amount</p>
                    <p className="text-2xl font-bold text-[#ED1C24]">₱{(selectedPayment.amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)} className="bg-[#2E3192] text-white hover:bg-[#1f2170]">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}