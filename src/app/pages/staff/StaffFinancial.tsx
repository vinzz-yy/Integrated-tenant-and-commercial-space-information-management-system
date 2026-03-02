import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Download, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { mockInvoices } from '../../services/mockData';
import { toast } from 'sonner';

export function StaffFinancial() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');

  useEffect(() => {
    if (user?.role !== 'staff') navigate('/');
  }, [user, navigate]);

  const handleExport = () => {
    // DJANGO BACKEND INTEGRATION POINT
    // API Call: GET /api/financial/invoices/export/?format=csv
    // Download CSV file with invoice data
    
    toast.success('Exporting financial report...');
  };

  const openReviewDialog = (invoice: any) => {
    setSelectedInvoice(invoice);
    setReviewStatus(invoice.status);
    setReviewNotes(invoice.notes || '');
    setIsReviewDialogOpen(true);
  };

  const handleReviewSubmit = () => {
    // Update invoice with review notes and status
    setInvoices(invoices.map(inv => 
      inv.id === selectedInvoice.id 
        ? { ...inv, status: reviewStatus, notes: reviewNotes }
        : inv
    ));
    toast.success('Invoice review submitted');
    setIsReviewDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'overdue':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financial Overview
          </h1>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Invoices ({invoices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.tenantName}</TableCell>
                    <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openReviewDialog(invoice)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Review Invoice</DialogTitle>
              <DialogDescription>
                Update invoice status and add review notes
              </DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4 py-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Invoice:</span> {selectedInvoice.id}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Tenant:</span> {selectedInvoice.tenantName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Amount:</span> ${selectedInvoice.amount.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Due Date:</span> {selectedInvoice.dueDate}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-status">Status</Label>
                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                    <SelectTrigger id="review-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-notes">Review Notes</Label>
                  <Textarea
                    id="review-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add review notes, comments, or observations..."
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReviewSubmit}>
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}