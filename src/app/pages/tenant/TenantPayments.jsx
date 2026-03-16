// TenantPayments.jsx - Tenant payment management
// Allows tenants to view invoices, payment history, and make payments

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { CreditCard, DollarSign, Download, FileText, Table as TableIcon } from 'lucide-react';
import api from '../../services/api.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { exportToCSV, exportToExcel, exportToWord, printToPDF } from '../../utils/export.js';

export function TenantPayments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for financial data
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  // Redirect if not tenant
  useEffect(() => {
    if (user?.role !== 'tenant') navigate('/');
  }, [user, navigate]);

  // Load tenant's invoices and payment history
  useEffect(() => {
    const load = async () => {
      // Fetch invoices for this tenant
      const inv = await api.financial.getInvoices({ tenant_id: user?.id });
      setInvoices(inv.results || []);
      
      // Fetch payments for this tenant
      const pay = await api.financial.getPayments({ tenant_id: user?.id });
      setPayments(pay.results || []);
    };
    load();
  }, [user]);

  // Handle opening payment dialog for an invoice
  const handlePayNow = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPayDialogOpen(true);
  };

  // Handle processing payment
  const handleProcessPayment = async () => {
    await api.financial.processPayment({
      invoice_id: selectedInvoice?.id,
      amount: selectedInvoice?.amount,
      payment_method: paymentMethod,
      tenant_id: user?.id,
    });
    setIsPayDialogOpen(false);
  };

  // Calculate financial summaries
  const outstanding = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidTotal = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0);

  // Export combined invoices and payments
  const handleExport = async (format) => {
    const headers = ['Type', 'ID', 'Amount', 'Status', 'Date/Due'];
    const rows = [
      ...invoices.map(inv => ['Invoice', inv.id, inv.amount, inv.status, inv.dueDate]),
      ...payments.map(pay => ['Payment', pay.id, pay.amount, pay.status || 'completed', pay.paymentDate]),
    ];
    if (format === 'csv') {
      exportToCSV(headers, rows, 'tenant_billing.csv');
    } else if (format === 'excel') {
      exportToExcel(headers, rows, 'tenant_billing.xls', 'Billing & Payments');
    } else if (format === 'word') {
      exportToWord(headers, rows, 'tenant_billing.doc', 'Billing & Payments');
    } else if (format === 'pdf') {
      printToPDF(headers, rows, 'Billing & Payments');
    }
  };
  return (
    <Layout role="tenant">
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold">Payments & Billing</h1>

        {/* Financial summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${outstanding.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Paid This Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${paidTotal.toLocaleString()}
              </div>
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

        {/* Invoices and payment history tabs */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Billing & Payments</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
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
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="invoices">
              <TabsList>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="history">Payment History</TabsTrigger>
              </TabsList>

              {/* Invoices tab */}
              <TabsContent value="invoices" className="mt-4">
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">{invoice.description}</p>
                          <p className="text-sm text-gray-500 mt-1">Invoice #{invoice.id}</p>
                          <p className="text-sm text-gray-500">Due: {invoice.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-lg">${(invoice.amount || 0).toLocaleString()}</p>
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                            {invoice.status}
                          </Badge>
                        </div>
                        {invoice.status === 'unpaid' && (
                          <Button onClick={() => handlePayNow(invoice)}>Pay Now</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Payment history tab */}
              <TabsContent value="history" className="mt-4">
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Payment for {payment.invoiceId}</p>
                          <p className="text-sm text-gray-500 mt-1">Date: {payment.paymentDate}</p>
                          <p className="text-sm text-gray-500">Method: {payment.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${(payment.amount || 0).toLocaleString()}</p>
                        <Badge>{payment.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
              <DialogDescription>
                Pay invoice {selectedInvoice?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4">
                {/* Amount due */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount Due</p>
                  <p className="text-2xl font-bold">${(selectedInvoice.amount || 0).toLocaleString()}</p>
                </div>
                
                {/* Payment method selection */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Credit card details (shown only if credit card selected) */}
                {paymentMethod === 'credit_card' && (
                  <>
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label>CVV</Label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleProcessPayment}>
                Pay ${(selectedInvoice?.amount || 0).toLocaleString()}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
