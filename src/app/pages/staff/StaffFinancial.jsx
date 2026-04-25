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
import { Download, FileText, CheckCircle, XCircle, Clock, Table as TableIcon, Plus, Search, User, Trash2, Eye, Pencil, MoreVertical, Printer } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  const handleEditPayment = (payment) => {
    setIsEditing(true);
    setEditingTransactionId(payment.id);
    setSelectedTenant({
      id: payment.user || payment.tenant_id,
      first_name: payment.tenant_name?.split(' ')[0] || '',
      last_name: payment.tenant_name?.split(' ').slice(1).join(' ') || '',
      unitNumber: payment.unitNumber,
    });
    setTransactionData({
      amount: String(payment.amount),
      payment_method: payment.payment_method || 'cash',
      description: payment.description || '',
      status: payment.status || 'completed',
      payment_date: payment.payment_date || new Date().toISOString().split('T')[0]
    });
    setIsTransactionDialogOpen(true);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [transactionData, setTransactionData] = useState({
    amount: '',
    payment_method: 'cash',
    description: 'Monthly Rent',
    status: 'completed',
    payment_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.role !== 'staff') navigate('/');
  }, [user, navigate]);

  const [loadingPayments, setLoadingPayments] = useState(false);

  const loadPayments = async (isSilent = false) => {
    if (!isSilent) setLoadingPayments(true);
    try {
      const pay = await connection.financial.getPayments();
      const serverPayments = Array.isArray(pay) ? pay : (pay?.results || []);
      
      if (isSilent) {
        setPayments(prev => {
          const serverIds = new Set(serverPayments.map(p => String(p.id)));
          const localOnly = prev.filter(p => p.id && !serverIds.has(String(p.id)));
          return [...localOnly, ...serverPayments].sort((a, b) => {
            const dateA = new Date(a.created_at || a.payment_date || 0);
            const dateB = new Date(b.created_at || b.payment_date || 0);
            return dateB - dateA;
          });
        });
      } else {
        setPayments(serverPayments);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
      if (!isSilent) toast.error('Failed to load payment records');
    } finally {
      if (!isSilent) setLoadingPayments(false);
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
      if (isEditing) {
        const updatedPayment = await connection.financial.updatePayment(editingTransactionId, {
          amount: parseFloat(transactionData.amount),
          payment_method: transactionData.payment_method,
          description: transactionData.description,
          status: transactionData.status,
          payment_date: transactionData.payment_date
        });

        toast.success('Transaction updated successfully');
        setPayments(prev => prev.map(p => p.id === editingTransactionId ? { ...p, ...updatedPayment } : p));
      } else {
        const newPayment = await connection.financial.createPayment({
          user: selectedTenant.id,
          amount: parseFloat(transactionData.amount),
          payment_method: transactionData.payment_method,
          description: transactionData.description,
          status: transactionData.status,
          payment_date: transactionData.payment_date
        });

        toast.success('Transaction saved successfully');
        // Update local state immediately with the new payment at the top
        setPayments(prev => [newPayment, ...prev]);
      }

      setIsTransactionDialogOpen(false);
      resetForm();
      
      // Then reload silently from server
      loadPayments(true);
    } catch (error) {
      toast.error(isEditing ? 'Failed to update transaction' : 'Failed to save transaction');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTenant(null);
    setSearchQuery('');
    setSearchResults([]);
    setIsEditing(false);
    setEditingTransactionId(null);
    setTransactionData({
      amount: '',
      payment_method: 'cash',
      description: 'Monthly Rent',
      status: 'completed',
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

  const handlePrintReceipt = (payment) => {
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
      case 'paid':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'unpaid':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return <XCircle className="h-3 w-3 mr-1" />;
    }
  };

  // Replaced with brand-color system from second code
  const getStatusBadge = (status) => {
    if (status === 'completed' || status === 'paid') {
      return { className: 'bg-[#2E3192] text-white hover:bg-[#2E3192]/90' };
    } else if (status === 'pending') {
      return { className: 'bg-[#F9E81B]/30 text-[#2E3192] hover:bg-[#F9E81B]/40' };
    } else if (status === 'unpaid') {
      return { className: 'bg-[#ED1C24] text-white hover:bg-[#ED1C24]/90' };
    } else {
      return { className: 'bg-[#ED1C24]/10 text-[#ED1C24] hover:bg-[#ED1C24]/20' };
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

        {/* Financial summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Paid Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₱{payments
                  .filter(p => p.status === 'completed' || p.status === 'paid')
                  .reduce((sum, p) => sum + Number(p.amount || 0), 0)
                  .toLocaleString('en-PH')}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Unpaid Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#ED1C24]">
                ₱{payments
                  .filter(p => p.status === 'unpaid' || p.status === 'pending')
                  .reduce((sum, p) => sum + Number(p.amount || 0), 0)
                  .toLocaleString('en-PH')}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2E3192]">{payments.length}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Payments table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#2E3192]">Payments ({payments.length})</CardTitle>
            <CardDescription>All recorded payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPayments ? (
              <div className="text-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2E3192] border-t-transparent mx-auto mb-3"></div>
                <p className="font-medium text-[#2E3192]">Loading transactions...</p>
              </div>
            ) : payments.length === 0 ? (
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4 text-[#2E3192]" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem onClick={() => handleViewPayment(payment)} className="cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4 text-[#2E3192]" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditPayment(payment)} className="cursor-pointer">
                                  <Pencil className="mr-2 h-4 w-4 text-[#2E3192]" />
                                  <span>Edit Status</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePrintReceipt(payment)} className="cursor-pointer">
                                  <Printer className="mr-2 h-4 w-4 text-[#2E3192]" />
                                  <span>Print Receipt</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
              <DialogTitle className="text-[#2E3192]">{isEditing ? 'Edit Transaction' : 'New Financial Transaction'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the details for this transaction.' : 'Search for a tenant and enter payment details to save a new transaction.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Tenant Search Section */}
              {!isEditing && (
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
              )}

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
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTenant(null)}
                      className="text-[#2E3192]"
                    >
                      Change
                    </Button>
                  )}
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

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="status" className="text-[#2E3192] font-medium">
                    Payment Status <span className="text-[#ED1C24]">*</span>
                  </Label>
                  <Select
                    value={transactionData.status}
                    onValueChange={(val) => setTransactionData({ ...transactionData, status: val })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#2E3192] font-medium">Description</Label>
                <Select
                  value={transactionData.description}
                  onValueChange={(val) => setTransactionData({ ...transactionData, description: val })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select description" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly Rent">Monthly Rent</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                  </SelectContent>
                </Select>
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
                {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Transaction' : 'Save Transaction')}
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