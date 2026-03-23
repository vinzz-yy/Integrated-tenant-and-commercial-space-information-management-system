import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Search, FileText, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import connection from '../../connected/connection.js';

export function ComplianceManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing compliance documents
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Review dialog states
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');

  // Format date to show only date (no time)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Initial load - fetch all compliance documents
  useEffect(() => {
    // Redirect if not admin
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const load = async () => {
      try {
        const resp = await connection.compliance.getDocuments();
        const list = Array.isArray(resp) ? resp : (resp?.results || []);
        setDocuments(list);
        setFilteredDocuments(list);
      } catch (e) {
        // Set empty arrays on error
        setDocuments([]);
        setFilteredDocuments([]);
      }
    };
    load();
  }, [user, navigate]);

  // Filter documents when search query or status filter changes
  useEffect(() => {
    let filtered = documents;
    
    // Apply search filter (search by tenant name or document type)
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        (doc.tenantName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.documentType || doc.document_type || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }
    
    setFilteredDocuments(filtered);
  }, [searchQuery, statusFilter, documents]);

  // Open review dialog with selected document data
  const openReviewDialog = (document) => {
    setSelectedDocument(document);
    setReviewStatus(document.status);
    setReviewNotes(document.notes || '');
    setIsReviewDialogOpen(true);
  };

  // Handle submission of document review
  const handleReviewSubmit = async () => {
    if (!selectedDocument) return;
    
    try {
      // Update document status via API
      await connection.compliance.updateDocumentStatus(String(selectedDocument.id), reviewStatus, reviewNotes);
      
      // Update local state with the new status
      setDocuments(documents.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, status: reviewStatus, notes: reviewNotes }
          : doc
      ));
      
      setIsReviewDialogOpen(false);
    } catch (error) {
      console.error('Error updating document status:', error);
      alert('Failed to update document status. Please try again.');
    }
  };

  // Helper function to get appropriate icon based on document status
  const getStatusIcon = (status) => {
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

  // Helper function to determine badge color based on status
  const getStatusVariant = (status) => {
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
        {/* Header section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Compliance Management
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage tenant compliance documents
            </p>
          </div>
        </div>

        {/* Stats cards showing document overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Accepted
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
              <CardTitle className="text-sm font-medium text-gray-600">
                Under Validation
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
              <CardTitle className="text-sm font-medium text-gray-600">
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

        {/* Filters card */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by tenant or document type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Status filter dropdown */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Accepted</SelectItem>
                  <SelectItem value="pending">Under Validation</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents table */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Documents ({filteredDocuments.length})</CardTitle>
            <CardDescription>All tenant compliance documents</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.tenantName}</TableCell>
                    <TableCell>{doc.documentType}</TableCell>
                    <TableCell className="text-sm">{formatDate(doc.uploadDate)}</TableCell>
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

        {/* Review Document Dialog */}
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
                {/* Document info summary */}
                <div>
                  <p className="text-sm font-medium">Tenant: {selectedDocument.tenantName}</p>
                  <p className="text-sm text-gray-600">Document: {selectedDocument.documentType}</p>
                  <p className="text-sm text-gray-600">File: {selectedDocument.fileName}</p>
                </div>

                {/* Document Preview */}
                {(selectedDocument.fileUrl || selectedDocument.file_url || selectedDocument.file) && (() => {
                  const url = selectedDocument.fileUrl || selectedDocument.file_url || selectedDocument.file;
                  const fullUrl = url.startsWith('/') ? `http://localhost:8000${url}` : url;
                  return (
                    <div className="mt-2 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center p-2 min-h-32 max-h-64">
                      {String(url).match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img 
                          src={fullUrl} 
                          alt="Document Preview" 
                          className="max-w-full h-full object-contain"
                        />
                      ) : (
                        <a 
                          href={fullUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <FileText className="h-5 w-5" /> View/Download Document
                        </a>
                      )}
                    </div>
                  );
                })()}
                
                {/* Status selector */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Accepted</SelectItem>
                      <SelectItem value="pending">Under Validation</SelectItem>
                      <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Review notes textarea */}
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