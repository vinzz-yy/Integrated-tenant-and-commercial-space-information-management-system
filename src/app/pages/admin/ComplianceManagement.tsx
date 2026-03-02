import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
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
import { Search, FileText, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';
import { mockComplianceDocuments } from '../../services/mockData';

// DJANGO BACKEND INTEGRATION POINT
// Compliance Management APIs:
// - GET /api/compliance/documents/ - Fetch all compliance documents
// - POST /api/compliance/documents/ - Upload new document
// - PATCH /api/compliance/documents/{id}/ - Update document status/notes
// - DELETE /api/compliance/documents/{id}/ - Delete document
// - GET /api/compliance/reports/ - Get compliance reports

export function ComplianceManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(mockComplianceDocuments);
  const [filteredDocuments, setFilteredDocuments] = useState(mockComplianceDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    // DJANGO BACKEND INTEGRATION POINT
    // API Call: GET /api/compliance/documents/
  }, [user, navigate]);

  useEffect(() => {
    let filtered = documents;

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocuments(filtered);
  }, [searchQuery, statusFilter, documents]);

  const openReviewDialog = (document: any) => {
    setSelectedDocument(document);
    setReviewStatus(document.status);
    setReviewNotes(document.notes || '');
    setIsReviewDialogOpen(true);
  };

  const handleReviewSubmit = () => {
    // DJANGO BACKEND INTEGRATION POINT
    // API Call: PATCH /api/compliance/documents/{selectedDocument.id}/
    // Request body: { status: reviewStatus, notes: reviewNotes }
    
    setDocuments(documents.map(doc => 
      doc.id === selectedDocument.id 
        ? { ...doc, status: reviewStatus, notes: reviewNotes }
        : doc
    ));
    toast.success('Document status updated');
    setIsReviewDialogOpen(false);
  };

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

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Compliance Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track and manage tenant compliance documents
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {documents.filter(d => d.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {documents.filter(d => d.status === 'expiring_soon').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by tenant or document type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Documents ({filteredDocuments.length})</CardTitle>
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
                {filteredDocuments.map((doc) => (
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
                        <Button variant="ghost" size="sm">
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