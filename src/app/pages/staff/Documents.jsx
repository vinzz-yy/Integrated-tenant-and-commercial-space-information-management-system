import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { FileText, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import connection from '../../connected/connection.js';

export function Documents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing compliance documents
  const [documents, setDocuments] = useState([]);
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

  // Redirect if not staff and load documents
  useEffect(() => {
    if (user?.role !== 'staff') {
      navigate('/');
      return;
    }
    
    const load = async () => {
      const data = await connection.documents.getDocuments();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setDocuments(list);
    };
    load();
  }, [user, navigate]);

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
        return 'default'; // Blue badge
      case 'pending':
        return 'secondary'; // Gray badge
      case 'expiring_soon':
        return 'destructive'; // Red badge
      default:
        return 'outline';
    }
  };

  // Open review dialog with selected document
  const openReviewDialog = (document) => {
    setSelectedDocument(document);
    setReviewStatus(document.status);
    setReviewNotes(document.notes || '');
    setIsReviewDialogOpen(true);
  };

  // Handle submission of document review
  const handleReviewSubmit = async () => {
    if (!selectedDocument) return;
    
    // Update document status via API
    await connection.documents.updateDocumentStatus(String(selectedDocument.id), reviewStatus, reviewNotes);
    
    // Update local state
    setDocuments(documents.map(doc => 
      String(doc.id) === String(selectedDocument.id) 
        ? { ...doc, status: reviewStatus, notes: reviewNotes }
        : doc
    ));
    
    setIsReviewDialogOpen(false);
  };

  // Placeholder for download functionality
  const handleDownload = (doc) => {};

  return (
    <Layout role="staff">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
             Documents Management
          </h1>
          <p className="text-gray-600 mt-1">
            View tenant compliance documents
          </p>
        </div>

        {/* Documents table */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Documents ({documents.length})</CardTitle>
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
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.tenantName}</TableCell>
                    <TableCell>{doc.documentType}</TableCell>
                    <TableCell className="text-sm">{formatDate(doc.uploadDate)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(doc.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(doc.status)}
                        {doc.status?.replace('_', ' ')}
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
                
                {/* Review notes */}
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