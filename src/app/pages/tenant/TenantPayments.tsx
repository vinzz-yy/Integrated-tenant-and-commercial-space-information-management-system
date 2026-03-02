import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { CreditCard, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { mockInvoices, mockPayments } from '../../services/mockData';

// DJANGO BACKEND INTEGRATION POINT
// Tenant Payments APIs:
// - GET /api/financial/invoices/?tenant_id={user.id} - Get tenant's invoices
// - GET /api/financial/payments/?tenant_id={user.id} - Get tenant's payment history
// - POST /api/financial/payments/ - Process payment

export function TenantPayments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices] = useState(mockInvoices.filter(inv => inv.tenantId === user?.id));
  const [payments] = useState(mockPayments.filter(pay => pay.tenantName === user?.firstName + ' ' + user?.lastName));
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  useEffect(() => {
    if (user?.role !== 'tenant') navigate('/');
  }, [user, navigate]);

  const handlePayNow = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsPayDialogOpen(true);
  };

  const handleProcessPayment = () => {
    // DJANGO BACKEND INTEGRATION POINT
    // API Call: POST /api/financial/payments/
    // Request body: { invoice_id, amount, payment_method, tenant_id }
    toast.success('Payment processed successfully');
    setIsPayDialogOpen(false);
  };

  return (
    <Layout role="tenant">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Payments & Billing</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
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
                ${invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
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

        <Card>
          <CardHeader>
            <CardTitle>Billing & Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="invoices">
              <TabsList>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="history">Payment History</TabsTrigger>
              </TabsList>

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
                          <p className="font-semibold text-lg">${invoice.amount.toLocaleString()}</p>
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
                        <p className="font-semibold text-lg">${payment.amount.toLocaleString()}</p>
                        <Badge>{payment.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount Due</p>
                  <p className="text-2xl font-bold">${selectedInvoice.amount.toLocaleString()}</p>
                </div>
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
              <Button onClick={handleProcessPayment}>Pay ${selectedInvoice?.amount.toLocaleString()}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
