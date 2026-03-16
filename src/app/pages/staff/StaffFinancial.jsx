// StaffFinancial.jsx - Staff view for financial records
// Allows staff to view and review invoices

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
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
import { Download, FileText, CheckCircle, XCircle, Clock, Table as TableIcon } from 'lucide-react';
import api from '../../services/api.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { exportToCSV, exportToExcel, exportToWord, exportToDocx, printToPDF } from '../../utils/export.js';

export function StaffFinancial() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing invoices
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');

  // Redirect if not staff
  useEffect(() => {
    if (user?.role !== 'staff') navigate('/');
  }, [user, navigate]);

  // Load invoices
  useEffect(() => {
    const load = async () => {
      const inv = await api.financial.getInvoices();
      setInvoices(inv.results || []);
    };
    load();
  }, []);

  // Export invoices with format choice
  const handleExport = async (format) => {
    try {
      const headers = ['Invoice ID', 'Tenant', 'Amount', 'Due Date', 'Status'];
      const rows = invoices.map(inv => [
        inv.id,
        inv.tenantName,
        inv.amount,
        inv.dueDate,
        inv.status,
      ]);
      if (format === 'csv') {
        exportToCSV(headers, rows, 'staff_invoices.csv');
      } else if (format === 'excel') {
        exportToExcel(headers, rows, 'staff_invoices.xls', 'Invoices');
      } else if (format === 'word') {
        exportToWord(headers, rows, 'staff_invoices.doc', 'Invoices');
      } else if (format === 'docx') {
        await exportToDocx(headers, rows, 'staff_invoices.docx', 'Invoices');
      } else if (format === 'pdf') {
        printToPDF(headers, rows, 'Invoices');
      }
    } catch (e) {
      alert('Failed to export. Please try again.');
    }
  };

  // Open review dialog with selected invoice
  const openReviewDialog = (invoice) => {
    setSelectedInvoice(invoice);
    setReviewStatus(invoice.status);
    setReviewNotes(invoice.notes || '');
    setIsReviewDialogOpen(true);
  };

  // Handle submission of invoice review
  const handleReviewSubmit = async () => {
    // Update local state (would normally call API)
    setInvoices(invoices.map(inv => 
      String(inv.id) === String(selectedInvoice.id) 
        ? { ...inv, status: reviewStatus, notes: reviewNotes }
        : inv
    ));
    setIsReviewDialogOpen(false);
  };

  // Helper function to get appropriate icon based on invoice status
  const getStatusIcon = (status) => {
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

  // Helper function to determine badge color based on status
  const getStatusVariant = (status) => {
    switch (status) {
      case 'paid':
        return 'default'; // Blue badge
      case 'pending':
        return 'secondary'; // Gray badge
      case 'overdue':
        return 'destructive'; // Red badge
      default:
        return 'outline';
    }
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        {/* Header with export button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financial Overview
          </h1>
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
        </div>
        
        {/* Invoices table */}
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
                    <TableCell>${(invoice.amount || 0).toLocaleString()}</TableCell>
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

        {/* Review Invoice Dialog */}
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
                {/* Invoice info summary */}
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Invoice:</span> {selectedInvoice.id}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Tenant:</span> {selectedInvoice.tenantName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Amount:</span> ${(selectedInvoice.amount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Due Date:</span> {selectedInvoice.dueDate}
                  </p>
                </div>

                {/* Status selector */}
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

                {/* Review notes */}
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
