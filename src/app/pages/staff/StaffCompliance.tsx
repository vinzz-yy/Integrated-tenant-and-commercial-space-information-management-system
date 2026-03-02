import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { FileText, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { mockComplianceDocuments } from '../../services/mockData';

export function StaffCompliance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(mockComplianceDocuments);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');

  useEffect(() => {
    if (user?.role !== 'staff') {
      navigate('/');
    }
  }, [user, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'expiring_soon':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expiring_soon':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const openReviewDialog = (document: any) => {
    setSelectedDocument(document);
    setReviewStatus(document.status);
    setReviewNotes(document.notes || '');
    setIsReviewDialogOpen(true);
  };

  const handleReviewSubmit = () => {
    setDocuments(documents.map(doc => 
      doc.id === selectedDocument.id 
        ? { ...doc, status: reviewStatus, notes: reviewNotes }
        : doc
    ));
    toast.success('Document status updated');
    setIsReviewDialogOpen(false);
  };

  const handleDownload = (doc: any) => {
    toast.success(`Downloading ${doc.fileName}...`);
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Compliance Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View tenant compliance documents
          </p>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Documents ({documents.length})</CardTitle>
            <CardDescription>All tenant compliance documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.tenantName}</TableCell>
                    <TableCell>{doc.documentType}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {doc.fileName}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{doc.uploadDate}</TableCell>
                    <TableCell className="text-sm">{doc.expiryDate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(doc.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(doc.status)}
                        {doc.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openReviewDialog(doc)}
                        >
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Document</DialogTitle>
              <DialogDescription>
                Update document status and add notes
              </DialogDescription>
            </DialogHeader>
            {selectedDocument && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Tenant: {selectedDocument.tenantName}</p>
                  <p className="text-sm text-gray-600">Document: {selectedDocument.documentType}</p>
                  <p className="text-sm text-gray-600">File: {selectedDocument.fileName}</p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add review notes..."
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReviewSubmit}>Save Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}